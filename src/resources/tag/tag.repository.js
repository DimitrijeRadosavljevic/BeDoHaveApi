import {neo4j} from "../../utils/db";


export const getTags = async (session, name) => {

  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (tag:Tag) ' +
      'WHERE tag.name CONTAINS $name ' +
      'RETURN tag ' +
      'LIMIT $limit',
      {
        name: (name ? name : ''),
        limit: neo4j.int(10),
      })
    if (result.records.length == 0) {
      return { tags: new Array() }
    }

    const tags = result.records.map(record => {
      const tag = record.get('tag')
      return {...tag.properties, id: tag.identity.toString() }
    })

    return tags
  });
}