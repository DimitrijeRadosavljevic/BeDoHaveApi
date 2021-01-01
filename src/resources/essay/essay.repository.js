import {driver, neo4j} from "../../utils/db";


export const getEssays = async (session, themeId, perPage, page) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (theme:Theme)--(essay:Essay) ' +
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
      return { essays: new Array, total: 0}
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
    console.log(result)
    if (result.records.length == 0) {
      return null
    }


    const essay = result.records[0].get('essay')
    return {...essay.properties, id: essay.identity.toString()}
  });
}


export const postEssay = async (session, essay, themeId) => {

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

    const relationship = await txc.run(
      'MATCH (theme:Theme), (essay:Essay) ' +
      'where ID(theme)=$themeId and ID(essay)=$essayId ' +
      'CREATE (theme)-[relationship:Write]->(essay) ' +
      'RETURN relationship',
      {
        themeId: neo4j.int(themeId),
        essayId: (essayResult.identity)
      }
    );

    if (relationship.records.length == 0) {
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

    console.log(result)
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

