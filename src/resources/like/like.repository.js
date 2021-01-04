import {neo4j, USER_ESSAY_LIKES, USER_THEME_LIKES} from "../../utils/db";


export const userLikesTheme = async (session, userId, themeId) => {

  return session.writeTransaction(async txc => {

    const likeRelationship = await txc.run(
      'MATCH (user:User), (theme:Theme) ' +
      'where ID(user) = $userId AND ID(theme) = $themeId ' +
      `CREATE (user)-[relationship:${USER_THEME_LIKES}]->(theme) ` +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        themeId: neo4j.int(themeId)
      }
    );

    // TODO check for errors
    return
  })
}

export const deleteUserLikesTheme = async (session, userId, themeId) => {

  return session.writeTransaction(async txc => {

    const likeRelationship = await txc.run(
      `MATCH (user:User)-[relationship:${USER_THEME_LIKES}]->(theme:Theme) ` +
      'where ID(user)=$userId and ID(theme) = $themeId ' +
      'DELETE relationship',
      {
        userId: neo4j.int(userId),
        themeId: neo4j.int(themeId)
      }
    );

    // TODO check for errors
    return
  })
}

export const userLikesEssay = async (session, userId, essayId) => {

  return session.writeTransaction(async txc => {

    const likeRelationship = await txc.run(
      'MATCH (user:User), (essay:Essay) ' +
      'where ID(user)=$userId and ID(essay) = $essayId ' +
      `CREATE (user)-[relationship:${USER_ESSAY_LIKES}]->(essay) ` +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        essayId: neo4j.int(essayId)
      }
    );

    // TODO check for errors
    return
  })
}

export const deleteUserLikesEssay = async (session, userId, essayId) => {

  return session.writeTransaction(async txc => {

    const likeRelationship = await txc.run(
      `MATCH (user:User)-[relationship:${USER_ESSAY_LIKES}]->(essay:Essay) ` +
      'where ID(user) = $userId and ID(essay) = $essayId ' +
      'DELETE relationship',
      {
        userId: neo4j.int(userId),
        essayId: neo4j.int(essayId)
      }
    );

    // TODO check for errors
    return
  })
}

export const doesUserLikesEssay = async (session, userId, essayId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (user:User), (essay:Essay) ' +
      'WHERE ID(user) = $userId AND ID(essay) = $essayId ' +
      `RETURN EXISTS( (user)-[:${USER_ESSAY_LIKES}]->(essay) ) as likes`,
      {
        userId: neo4j.int(userId),
        essayId: neo4j.int(essayId)
      }
    )

    return result.records[0].get('likes')
  })
}

export const doesUserLikesTheme = async (session, userId, themeId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (user:User), (theme:Theme) ' +
      'WHERE ID(user) = $userId AND ID(theme) = $themeId ' +
      `RETURN EXISTS( (user)-[:${USER_THEME_LIKES}]->(theme) ) as likes`,
      {
        userId: neo4j.int(userId),
        themeId: neo4j.int(themeId)
      }
    )

    return result.records[0].get('likes')
  })
}
