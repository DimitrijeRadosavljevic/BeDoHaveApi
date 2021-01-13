import {HABIT_COMPLETED, neo4j } from "../../utils/db";
import {session} from "neo4j-driver";


export const getHabitRecords = async (session, habitId, perPage, page) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(habitRecord:HabitRecord) ` +
      'WHERE ID(habit) = $habitId ' +
      'WITH collect(habitRecord) as habitRecords, count(habitRecord) as total ' +
      'UNWIND habitRecords as habitRecord ' +
      'RETURN habitRecord, total ' +
      'ORDER BY habitRecord.date DESC ' +
      'SKIP $skip ' +
      'LIMIT $limit',
      {
        habitId: neo4j.int(habitId),
        skip: neo4j.int((page - 1) * perPage),
        limit: neo4j.int(perPage),
      })


    if (result.records.length == 0) {
      return { habitRecords: new Array(), total: 0}
    }

    const habitRecords = result.records.map(record => {
      const habitRecord = record.get('habitRecord')

      return {
        ...habitRecord.properties,
        date: habitRecord.properties.date.toString(),
        id: habitRecord.identity.toString()
      }
    })

    const total = parseInt(result.records[0].get('total').toString())
    return { habitRecords, total }
  });
}

export const postHabitRecord = async (session, habitId, habitRecord) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'CREATE (habitRecord:HabitRecord { date: date($date), comment: $comment, status: $status }) ' +
      'RETURN habitRecord',
      {
        date: habitRecord.date,
        comment: habitRecord.comment,
        status: habitRecord.status
      }
    )

    if (result.records.length == 0) {
      // TODO handle error
    }

    const habitRecordResult = result.records[0].get('habitRecord')

    const habitRecordRelationship = await txc.run(
      'MATCH (habit:Habit), (habitRecord:HabitRecord) ' +
      'WHERE ID(habit) = $habitId and ID(habitRecord) = $habitRecordId ' +
      `CREATE (habit)-[relationship:${HABIT_COMPLETED}]->(habitRecord) ` +
      'RETURN relationship',
      {
        habitId: neo4j.int(habitId),
        habitRecordId: (habitRecordResult.identity)
      }
    );

    if (habitRecordRelationship.records.length == 0) {
      // TODO handle error
    }

    return {
      id: habitRecordResult.identity.toString(),
      ...habitRecordResult.properties,
      date: habitRecordResult.properties.date.toString()
    }
  });
}


export const putHabitRecord = async (session, habitRecord) => {
  return session.writeTransaction(async txc => {
    const habitRecordResult = await txc.run(
      'MATCH (habitRecord:HabitRecord) ' +
      'WHERE ID(habitRecord) = $habitRecordId ' +
      'SET habitRecord.date = date($date), habitRecord.comment = $comment, habitRecord.status = $status ' +
      'RETURN habitRecord',
      {
        habitRecordId: neo4j.int(habitRecord.id),
        date: habitRecord.date,
        comment: habitRecord.comment,
        status: habitRecord.status
      }
    );

    if (habitRecordResult.records.length == 0) {
      // TODO (handle error)
    }

    const habitRecordUpdated = habitRecordResult.records[0].get('habitRecord')
    return {
      id: habitRecordUpdated.identity.toString(),
      ...habitRecordUpdated.properties,
      date: habitRecordUpdated.properties.date.toString()
    }
  });
}


export const deleteHabitRecord = async (session, habitRecordId) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (habitRecord:HabitRecord) ' +
      'WHERE ID(habitRecord) = $habitRecordId ' +
      'DETACH DELETE habitRecord',
      {
        habitRecordId: neo4j.int(habitRecordId)
      }
    );

    console.log(result)
    // TODO (check result object when deleting node)
  });
}

