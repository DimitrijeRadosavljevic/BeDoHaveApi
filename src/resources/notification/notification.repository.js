import { Neo4jError } from "neo4j-driver";
import { USER_NOTIFICATION, neo4j} from "../../utils/db";

export const postNotification = async (session, userId, content) => {
    let date = new Date();
    let currentDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    return session.writeTransaction(async txc => {
          const result = await txc.run(
            `CREATE (notification:Notification {content: $content, seen: $seen, date: $date}) RETURN notification`,
          {
           content: content,
           seen: false,
           date: currentDate 
          })
          
        let notificationId = 0;
        if (result.records.length != 0) {
            notificationId = result.records[0].get('notification').identity;
        }

        const relationship = await txc.run(
            `MATCH (user:User),(notification:Notification) where ID(user)= $userId and ID(notification)= $notificationId CREATE (user)-[relationship:${USER_NOTIFICATION}]->(notification) RETURN relationship`,
            {
              userId: neo4j.int(userId),
              notificationId: notificationId  
            }
        )

        if(relationship.records.length == 0) {
            console.log("notification not created");
        }
    })
}

export const getNotifications = async (session, userId, seen, perPage, page) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
      `MATCH (user:User)-[:${USER_NOTIFICATION}]->(notification:Notification) ` +
      'WHERE ID(user)= $userId and notification.seen = $seen ' +
      'WITH collect(notification) as notifications, count(notification) as total ' +
      'UNWIND notifications as notification ' +
      'RETURN notification, total ' +
      'ORDER BY notification.date DESC ' +
      'SKIP $skip ' +
      'LIMIT $limit',
    {
     seen: (seen == 'true' ? true : false),
     userId: neo4j.int(userId),
     skip: neo4j.int((page - 1) * perPage),
     limit: neo4j.int(perPage)
    })
    
    if (result.records.length == 0) {
      return { notifications: new Array(), total: 0}
    }

    const notifications = result.records.map(record => {
      const notification = record.get('notification')
      return {...notification.properties, id: notification.identity.toString() }
    })
    const total = parseInt(result.records[0].get('total').toString())
    return { notifications, total}
  })
}

export const putNotifications = async (session, userId, notification) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
     `MATCH (user:User)-[:${USER_NOTIFICATION}]->(notification:Notification) where ID(user)= $userId SET notification.seen= $seen RETURN notification`,
    {
      userId: neo4j.int(userId),
      seen: notification.seen
    })
    
    let notifications = new Array()
    if (result.records.length != 0) {
        notifications = result.records.map(record => {
        const notification = record.get('notification')
        return {...notification.properties, id: notification.identity.toString() }
      })
    }

    return { notifications }

  })
}

export const deleteAllNotifications = async (session, userId) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
     `MATCH (user:User)-[:${USER_NOTIFICATION}]->(notification:Notification) where ID(user)= $userId DETACH DELETE notification RETURN notification,ID(notification)`,
    {
      userId: neo4j.int(userId)
    })

    if (result.records.length == 0) {
      return null
    }

    const id = result.records[0].get('notification').identity.toString();
    return { id }
  })
}

export const deleteNotification = async (session, userId, notificationId) => {
  return session.writeTransaction(async txc => {
    const result = await txc.run(
     `MATCH (user:User)-[:${USER_NOTIFICATION}]->(notification:Notification) where ID(user)= $userId and ID(notification)= $notificationId DETACH DELETE notification RETURN notification,ID(notification)`,
    {
      userId: neo4j.int(userId),
      notificationId: neo4j.int(notificationId)
    })

    if (result.records.length == 0) {
      return null
    }

    console.log("Obrisana notifikacija"+ notificationId);
    const id = result.records[0].get('notification').identity.toString();
    return { id }
  })
}