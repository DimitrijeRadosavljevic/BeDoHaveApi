import {driver, neo4j, THEME_ESSAY, USER_ESSAY, USER_ESSAY_LIKES, USER_THEME} from "../../utils/db";


export const getEssays = async (session, themeId, perPage, page) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (theme:Theme)-[:${THEME_ESSAY}]->(essay:Essay) ` +
      'WHERE ID(theme) = $themeId ' +
      'WITH collect(essay) as essays, count(essay) as total ' +
      'UNWIND essays as essay ' +
      'RETURN essay, total ' +
      'ORDER BY essay.date DESC ' +
      'SKIP $skip ' +
      'LIMIT $limit',
      {
        themeId: neo4j.int(themeId),
        skip: neo4j.int((page - 1) * perPage),
        limit: neo4j.int(perPage),
      })
    if (result.records.length == 0) {
      return {essays: new Array, total: 0}
    }

    const essays = result.records.map(record => {
      const essay = record.get('essay')
      return {...essay.properties, id: essay.identity.toString()}
    })

    const total = parseInt(result.records[0].get('total').toString())
    return {essays, total}
  });
}

export const getEssay = async (session, essayId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (essay:Essay) ' +
      'WHERE ID(essay) = $essayId ' +
      'RETURN essay',
      {
        essayId: neo4j.int(essayId)
      })

    if (result.records.length == 0) {
      return null
    }


    const essay = result.records[0].get('essay')
    return {...essay.properties, id: essay.identity.toString()}
  });
}


export const postEssay = async (session, userId, themeId, essay) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'CREATE (essay:Essay {title: $title, content: $content, date: $date}) ' +
      'RETURN essay',
      {
        title: essay.title,
        content: essay.content,
        date: essay.date
      }
    )

    if (result.records.length == 0) {
      // TODO handle error
    }

    const essayResult = result.records[0].get('essay')

    const themeRelationship = await txc.run(
      'MATCH (theme:Theme), (essay:Essay) ' +
      'where ID(theme)=$themeId and ID(essay)=$essayId ' +
      `CREATE (theme)-[relationship:${THEME_ESSAY}]->(essay) ` +
      'RETURN relationship',
      {
        themeId: neo4j.int(themeId),
        essayId: (essayResult.identity)
      }
    );

    if (themeRelationship.records.length == 0) {
      // TODO handle error
    }

    const userRelationship = await txc.run(
      'MATCH (user:User), (essay:Essay) ' +
      'where ID(user)=$userId and ID(essay)=$essayId ' +
      `CREATE (user)-[relationship:${USER_ESSAY}]->(essay) ` +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        essayId: (essayResult.identity)
      }
    );

    if (userRelationship.records.length == 0) {
      // TODO handle error
    }

    return {...essayResult.properties, id: essayResult.identity.toString()}
  });
}


export const putEssay = async (session, essay) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (essay:Essay) ' +
      'WHERE ID(essay) = $essayId ' +
      'SET essay.title = $title, essay.content = $content, essay.date = $date ' +
      'RETURN essay',
      {
        essayId: neo4j.int(essay.id),
        title: essay.title,
        content: essay.content,
        date: essay.date
      }
    );

    if (result.records.length == 0) {
      // TODO (handle error)
    }

    const essayUpdated = result.records[0].get('essay')
    return {...essayUpdated.properties, id: essayUpdated.identity.toString()}
  });
}


export const deleteEssay = async (session, essayId) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (essay:Essay) ' +
      'WHERE ID(essay) = $essayId ' +
      'DETACH DELETE essay',
      {
        essayId: neo4j.int(essayId)
      }
    );

    console.log(result)
    // TODO (check result object when deleting node)
  });
}

exports.userOwnsEssay = async (session, userId, essayId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (user:User)-[:${USER_THEME}]->(theme:Theme)-[:${THEME_ESSAY}]->(essay:Essay) ` +
      'WHERE ID(user) = $userId AND  ID(essay) = $essayId ' +
      'RETURN essay',
      {
        userId: neo4j.int(userId),
        essayId: neo4j.int(essayId)
      }
    )

    return (result.records.length == 0 ? false : true)
  })
}

export const getEssaysWithUser = async (session, themeId, perPage, page, userId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (user:User)--(theme:Theme)--(essay:Essay)' +
      'WHERE ID(theme) = $themeId ' +
      'WITH collect(essay) as essays, count(essay) as total, user ' +
      'UNWIND essays as essay ' +
      'RETURN essay, user, total ' +
      'ORDER BY essay.date DESC ' +
      'SKIP $skip ' +
      'LIMIT $limit',
      {
        themeId: neo4j.int(themeId),
        userId: neo4j.int(userId),
        skip: neo4j.int((page - 1) * perPage),
        limit: neo4j.int(perPage),
      })

    if (result.records.length == 0) {
      return {essays: new Array, total: 0}
    }


    const essays = result.records.map(record => {
      const essay = record.get('essay')
      const user = record.get('user')
      return {
        ...essay.properties,
        id: essay.identity.toString(),
        user: {
          ...user.properties,
          id: user.identity.toString()
        }
      }
    })

    const total = parseInt(result.records[0].get('total').toString())
    return {essays, total}
  });
}

// fetch essay, with theme, user who owns theme and user who wrote essay
export const getEssayDetail = (session, essayId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (userOwnsTheme:User)-[:Owns]->(theme:Theme)-[:Has]->(essay:Essay)<-[:Wrote]-(userWroteEssay:User) ` +
      'WHERE ID(essay) = $essayId ' +
      'WITH userOwnsTheme, theme, userWroteEssay, essay ' +
      'RETURN essay, userOwnsTheme, theme, userWroteEssay',
      {
        essayId: neo4j.int(essayId)
      })

    const essay = result.records[0].get('essay')
    const theme = result.records[0].get('theme')
    const userOwnsTheme = result.records[0].get('userOwnsTheme')
    const userWroteEssay = result.records[0].get('userWroteEssay')

    return {
      ...essay.properties, id: essay.identity.toString(),
      theme: {
        ...theme.properties, id: theme.identity.toString(),
        user: {
          ...userOwnsTheme.properties, id: userOwnsTheme.identity.toString()
        }
      },
      user: {
        ...userWroteEssay.properties, id: userWroteEssay.identity.toString()
      }
    }
  });
}

export const getEssayLikersCount = (session, essayId) => {
  return session.readTransaction(async txc => {
    const likersResult = await txc.run(
      `MATCH (userLikesEssay:User)-[:${USER_ESSAY_LIKES}]->(essay:Essay) ` +
      'WHERE ID(essay) = $essayId ' +
      'WITH count(userLikesEssay) as likersCount ' +
      'RETURN likersCount',
      {
        essayId: neo4j.int(essayId)
      })

    return likersResult.records[0].get('likersCount').toString()
  })


  // const likersResult = await txc.run(
  //   `MATCH (userLikesEssay:User)-[:${USER_ESSAY_LIKES}]->(essay:Essay) ` +
  //   'WHERE ID(essay) = $essayId ' +
  //   'WITH collect(userLikesEssay) as likers ' +
  //   'RETURN likers',
  //   {
  //     essayId: neo4j.int(essayId)
  //   })

  // const likers = likersResult.records[0].get('likers').map(user => {
  //   return {
  //     ...user.properties,
  //     id: user.identity.toString()
  //   }
  // })
}

export const getTheme = (session, essayId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (theme:Theme)-[:${THEME_ESSAY}]->(essay:Essay) ` +
      'WHERE ID(essay) = $essayId ' +
      'RETURN theme',
      {
        essayId: neo4j.int(essayId)
      }
    )

    console.log(result.records[0].get('theme'))
    const theme = result.records[0].get('theme')
    return {
      ...theme.properties,
      id: theme.identity.toString()
    }
  })
}


