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
      'MATCH (a:essay) where ID(a) = $essayId ' +
      'RETURN a,ID(a)',
      {
        essayId: neo4j.int(essayId)
      })
    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const essay = singleRecord.get(0)
    const essayId = singleRecord.get(1).low;
    return {...essay.properties, id: essayId}
  });
}


export const postEssay = async (session, essay, themeId) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'CREATE (a:Essay {title: $title, content: $content, date: $date}) ' +
      'RETURN a,ID(a)',
      {
        title: essay.title,
        content: essay.content,
        date: essay.date
      }
    )

    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const essayResult = singleRecord.get(0)
    const essayId = singleRecord.get(1).low;

    const relationship = await txc.run(
      'MATCH (theme:Theme), (essay:Essay) ' +
      'where ID(theme)=$themeId and ID(essay)=$essayId ' +
      'CREATE (theme)-[relationship:Write]->(essay) ' +
      'RETURN relationship',
      {
        themeId: neo4j.int(themeId),
        essayId: neo4j.int(essayId)
      }
    );

    if (relationship.records.length == 0) {
      return null
    }

    return {...essayResult.properties, id: essayId}
  });
}


export const deleteEssay = async (session, essayId) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (essay:Essay) ' +
      'WHERE ID(essay) = $essayId' +
      'DETACH DELETE essay',
      {
        essayId: neo4j.int(essayId)
      }
    );

    console.log(result)
    // TODO (check result object when deleting node)
  });
}


export const putEssay = async (session, essay) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (essay:Essay) where ID(essay) = $essayId' +
      'SET essay.title = $title, essay.content = $content, essay.date = $date ' +
      'RETURN essay,ID(essay)',
      {
        essayId: neo4j.int(essay.id),
        title: essay.title,
        content: essay.content,
        date: essay.date
      }
    );

    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const essay = singleRecord.get(0)
    const essayId = singleRecord.get(1).low;
    return {...essay.properties, id: essayId}
  });
}

