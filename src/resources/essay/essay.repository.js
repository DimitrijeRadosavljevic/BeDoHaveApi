import {driver, neo4j} from "../../utils/db";


export const getEssays = async (session, themeId) => {
  return session.readTransaction(async txc => {
    const result = txc.run('MATCH (t:Theme)--(e:Essay) where ID(t) = $themeId RETURN e,ID(e)', {themeId: neo4j.int(themeId)})
    if (result.records.length == 0) {
      return null
    }

    const essays = result.records.map(essay => {
      return {...essay.get(0).properties, id: essay.get(1).low }
    })
    return essays
  });
}

export const getEssay = async (session, essayId) => {
  return session.readTransaction(async txc => {
    const result = txc.run('MATCH (a:essay) where ID(a) = $essayId RETURN a,ID(a)', {essayId: neo4j.int(essayId)})
    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const essay = singleRecord.get(0)
    const essayId = singleRecord.get(1).low;
    return {...essay.properties, id: essayId}
  });
}

