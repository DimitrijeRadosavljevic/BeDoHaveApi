import {neo4j, USER_HABIT} from "../../utils/db";


export const getHabits = async (session, userId, perPage, page) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (user:User)-[:${USER_HABIT}]->(habit:Habit) ` +
      'WHERE ID(user) = $userId ' +
      'WITH habit, count(habit) as total ' +
      'RETURN habit, total ' +
      'ORDER BY habit.name DESC ' +
      'SKIP $skip ' +
      'LIMIT $limit',
      {
        userId: neo4j.int(userId),
        skip: neo4j.int((page - 1) * perPage),
        limit: neo4j.int(perPage),
      })
    if (result.records.length == 0) {
      return {habits: new Array, total: 0}
    }

    const habits = result.records.map(record => {
      const habit = record.get('habit')
      return {
        ...habit.properties,
        id: habit.identity.toString()
      }
    })

    const total = parseInt(result.records[0].get('total').toString())
    return { habits, total }
  });
}



export const getHabit = async (session, habitId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      'MATCH (habit:Habit) ' +
      'WHERE ID(habit) = $habitId ' +
      'RETURN habit',
      {
        habitId: neo4j.int(habitId)
      })

    if (result.records.length == 0) {
      return null
    }


    const habit = result.records[0].get('habit')
    return {...habit.properties, id: habit.identity.toString()}
  });
}


export const postHabit = async (session, userId, habit) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'CREATE (habit:Habit {name: $name}) ' +
      'RETURN habit',
      {
        name: habit.name
      }
    )

    if (result.records.length == 0) {
      // TODO handle error
    }

    const habitResult = result.records[0].get('habit')

    const themeRelationship = await txc.run(
      'MATCH (user:User), (habit:Habit) ' +
      'WHERE ID(user) = $userId and ID(habit) = $habitId ' +
      `CREATE (user)-[relationship:${USER_HABIT}]->(habit) ` +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        habitId: (habitResult.identity)
      }
    );

    if (themeRelationship.records.length == 0) {
      // TODO handle error
    }

    return {...habitResult.properties, id: habitResult.identity.toString()}
  });
}


export const putHabit = async (session, habit) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (habit:Habit) ' +
      'WHERE ID(habit) = $habitId ' +
      'SET habit.name = $name ' +
      'RETURN habit',
      {
        habitId: neo4j.int(habit.id),
        name: habit.name,
      }
    );

    if (result.records.length == 0) {
      // TODO (handle error)
    }

    const habitUpdated = result.records[0].get('habit')
    return {...habitUpdated.properties, id: habitUpdated.identity.toString()}
  });
}


export const deleteHabit = async (session, habitId) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'MATCH (habit:Habit) ' +
      'WHERE ID(habit) = $habitId ' +
      'DETACH DELETE habit',
      {
        habitId: neo4j.int(habitId)
      }
    );

    console.log(result)
    // TODO (check result object when deleting node)
  });
}

