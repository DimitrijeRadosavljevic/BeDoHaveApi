import date from 'date-and-time'
import {HABIT_COMPLETED, HABIT_TAG, neo4j, USER_HABIT} from "../../utils/db";


export const getHabits = async (session, userId, perPage, page) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (user:User)-[:${USER_HABIT}]->(habit:Habit) ` +
      'WHERE ID(user) = $userId ' +
      'WITH collect(habit) as habits, count(habit) as total ' +
      'UNWIND habits as habit ' +
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
      `OPTIONAL MATCH (habit)-[:${HABIT_TAG}]->(tag:Tag) ` +
      'WITH habit, collect(tag) as tags ' +
      'RETURN habit, tags',
      {
        habitId: neo4j.int(habitId)
      })


    if (result.records.length == 0) {
      return null
    }


    const habit = result.records[0].get('habit')
    const tags = result.records[0].get('tags').map(tag => {
      return {
        ...tag.properties,
        id: tag.identity.toString()
      }
    })

    return {
      id: habit.identity.toString(),
      ...habit.properties,
      date: habit.properties.date.toString(),
      tags
    }
  });
}


export const postHabit = async (session, userId, habit) => {

  return session.writeTransaction(async txc => {
    const result = await txc.run(
      'CREATE (habit:Habit { ' +
          'name: $name, ' +
          'description: $description, ' +
          'frequency: $frequency, ' +
          'frequencySpecific: $frequencySpecific, ' +
          'date: date($date) }) ' +
          'RETURN habit',
      {
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        frequencySpecific: habit.frequencySpecific,
        date: habit.date
          // new neo4j.types.Date(
          // parseInt(date.format(habit.date, 'YYYY')),
          // parseInt(date.format(habit.date, 'MM')),
          // parseInt(date.format(habit.date, 'DD')))
      }
    )

    if (result.records.length == 0) {
      // TODO handle error
    }

    const habitResult = result.records[0].get('habit')

    const habitRelationship = await txc.run(
      'MATCH (user:User), (habit:Habit) ' +
      'WHERE ID(user) = $userId and ID(habit) = $habitId ' +
      `CREATE (user)-[relationship:${USER_HABIT}]->(habit) ` +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        habitId: (habitResult.identity)
      }
    );

    if (habitRelationship.records.length == 0) {
      // TODO handle error
    }

    habit.tags.map(async tag => {
      const relationship = await txc.run(
        'MATCH (habit:Habit), (tag:Tag) ' +
        'WHERE ID(habit) = $habitId and ID(tag) = $tagId ' +
        `CREATE (habit)-[relationship:${HABIT_TAG}]->(tag) ` +
        'RETURN relationship',
        {
          habitId: habitResult.identity,
          tagId: neo4j.int(tag.id)
        }
      )
      if(relationship.recordslength == 0) {
        return null
      }
    })

    return {...habitResult.properties, id: habitResult.identity.toString()}
  });
}


export const putHabit = async (session, habit) => {
  return session.writeTransaction(async txc => {
    const habitResult = await txc.run(
      'MATCH (habit:Habit) ' +
      'WHERE ID(habit) = $habitId ' +
      'SET habit.name = $name, ' +
      'habit.description = $description, ' +
      'habit.frequency = $frequency, ' +
      'habit.frequencySpecific = $frequencySpecific, ' +
      'habit.date = $date ' +
      'RETURN habit',
      {

        habitId: neo4j.int(habit.id),
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        frequencySpecific: habit.frequencySpecific,
        date: habit.date
      }
    );

    if (habitResult.records.length == 0) {
      // TODO (handle error)
    }

    const r = await txc.run(
      `MATCH (habit:Habit)-[relationship:${HABIT_TAG}]->(:Tag) ` +
      'WHERE ID(habit) = $habitId ' +
      'DELETE relationship ',
      {
        habitId: neo4j.int(habit.id),
        name: habit.name,
      }
    );

    habit.tags.map(async tag => {
      const relationship = await txc.run(
        'MATCH (habit:Habit), (tag:Tag) ' +
        'WHERE ID(habit) = $habitId and ID(tag) = $tagId ' +
        `CREATE (habit)-[relationship:${HABIT_TAG}]->(tag) ` +
        'RETURN relationship',
        {
          habitId: neo4j.int(habit.id),
          tagId: neo4j.int(tag.id)
        }
      )
      if(relationship.recordslength == 0) {
        return null
      }
    })

    const habitUpdated = habitResult.records[0].get('habit')
    return {...habitUpdated.properties, id: habitUpdated.identity.toString()}
  });
}


export const deleteHabit = async (session, habitId) => {

  return session.writeTransaction(async txc => {
    const deleteHabitRecords = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(habitRecord:HabitRecord) ` +
      'WHERE ID(habit) = $habitId ' +
      'DETACH DELETE habitRecord',
      {
        habitId: neo4j.int(habitId)
      }
    );


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

export const getDailyStatistics = async (session, habitId, habitDate) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(record:HabitRecord) ` +
      'WHERE ID(habit) = $habitId AND record.status = true ' +
      'RETURN record.date as date ' +
      'ORDER BY date ASC ',
      {
        habitId: neo4j.int(habitId)
      }
    )

    const habitRecords = result.records.map(record => {
      const date = record.get('date').toString()
      return { date }
    })

    if (habitRecords.length == 0) return 0


    const daysPassedSinceStart = Math.floor(date.subtract(new Date(), new Date(habitDate)).toDays()) + 1
    const habitCompletedSuccessfully = habitRecords.length

    const statistics = (habitCompletedSuccessfully * 100 / daysPassedSinceStart).toFixed(2)
    return statistics > 100 ? 100.00 : statistics
  })
}

export const getWeeklyStatistics = async (session, habitId, habitDate, perWeek) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(record:HabitRecord) ` +
      'WHERE ID(habit) = $habitId AND record.status = true ' +
      'RETURN record.date as date ' +
      'ORDER BY date ASC ',
      {
        habitId: neo4j.int(habitId)
      }
    )

    const habitRecords = result.records.map(record => {

      const date = record.get('date').toString()
      return { date }
    })

    if (habitRecords.length == 0) return 0

    const successPercentage = new Array()

    while (date.format(habitDate, 'dddd') != 'Monday') {
      habitDate = date.addDays(habitDate, -1);
    }

    const now = new Date();
    while(habitDate.getTime() < now.getTime()) {

      const doneTimes = habitRecords.filter(record => {
        const recordTime = (new Date(record.date)).getTime();
        return habitDate.getTime() <= recordTime  && recordTime < date.addDays(habitDate, 7).getTime()
      }).length
      const success = doneTimes * 100 / perWeek
      successPercentage.push(success > 100 ? 100 : success)
      habitDate = date.addDays(habitDate, 7)
    }

    return (successPercentage.reduce((acc, value) => { return acc + value }, 0) / successPercentage.length).toFixed(2);
  })
}


export const getMonthlyStatistics = async (session, habitId, habitDate, perMonth) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(record:HabitRecord) ` +
      'WHERE ID(habit) = $habitId AND record.status = true ' +
      'RETURN record.date as date ' +
      'ORDER BY date ASC ',
      {
        habitId: neo4j.int(habitId)
      }
    )

    const habitRecords = result.records.map(record => {
      const date = record.get('date').toString()
      return { date }
    })

    if (habitRecords.length == 0) return 0

    const successPercentage = new Array()

    while (date.format(habitDate, 'D') != 1) {
      habitDate = date.addDays(habitDate, -1);
    }

    const now = new Date();
    while(habitDate.getTime() < now.getTime()) {
      const doneTimes = habitRecords.filter(record => {
        const recordTime = (new Date(record.date)).getTime();
        return habitDate.getTime() <= recordTime  && recordTime < date.addMonths(habitDate, 1).getTime()
      }).length
      const success = doneTimes * 100 / perMonth
      successPercentage.push(success > 100 ? 100 : success)
      habitDate = date.addMonths(habitDate, 1)
    }

    return (successPercentage.reduce((acc, value) => { return acc + value }, 0) / successPercentage.length).toFixed(2);
  })
}

export const getSpecificDaysStatistics = async (session, habitId, habitDate, days) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (habit:Habit)-[:${HABIT_COMPLETED}]->(record:HabitRecord) ` +
      'WHERE ID(habit) = $habitId AND record.status = true ' +
      'RETURN record.date as date ' +
      'ORDER BY date ASC ',
      {
        habitId: neo4j.int(habitId)
      }
    )

    const setHelper = new Set()
    result.records.forEach(record => {
      const date = record.get('date').toString()
      setHelper.add(date)
    })
    const habitRecords = [...setHelper]

    const daysOfWeek = new Array();
    if (days[0] == 1) daysOfWeek.push('Monday')
    if (days[1] == 1) daysOfWeek.push('Tuesday')
    if (days[2] == 1) daysOfWeek.push('Wednesday')
    if (days[3] == 1) daysOfWeek.push('Thursday')
    if (days[4] == 1) daysOfWeek.push('Friday')
    if (days[5] == 1) daysOfWeek.push('Saturday')
    if (days[6] == 1) daysOfWeek.push('Sunday')

    const successPercentage = new Array()

    while (date.format(habitDate, 'dddd') != 'Monday') {
      habitDate = date.addDays(habitDate, -1);
    }

    const now = new Date();
    while(habitDate.getTime() < now.getTime()) {
      const doneTimes = habitRecords.filter(record => {
        const recordDayOfWeek = date.format(new Date(record), 'dddd')
        const recordTime = (new Date()).getTime()
        return habitDate.getTime() <= recordTime  && recordTime < date.addDays(habitDate, 7).getTime() && daysOfWeek.includes(recordDayOfWeek)
      }).length
      successPercentage.push(doneTimes * 100 / daysOfWeek.length)
      habitDate = date.addDays(habitDate, 7)
    }

    return (successPercentage.reduce((acc, value) => { return acc + value }, 0) / successPercentage.length).toFixed(2);
  })
}
