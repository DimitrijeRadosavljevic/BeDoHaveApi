import {neo4j} from "../../utils/db";
import _ from 'lodash'

//post user
exports.postUser = async (session, user) => {

  const result = await session.run(
    'CREATE (a:User {name: $name, email: $email, password: $password}) RETURN a,ID(a)',
    {
      name: user.name,
      email: user.email,
      password: user.password
    }
  )

  const singleRecord = result.records[0]
  const node = singleRecord.get(0)
  const nodeId = singleRecord.get(1).low;
  
  await session.close();
  return {...node.properties, id: nodeId}
}

//get user
exports.getUser = async (session, id) => {
  return session.readTransaction(async txc => {
    const result = await txc.run('MATCH (a) where ID(a) = $id RETURN a,ID(a)', {id: neo4j.int(id)})
    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const user = singleRecord.get(0)
    const userId = singleRecord.get(1).low;
    return {...user.properties, id: userId}
  });
}

exports.getUserByEmail = async (session, email) => {
  return session.readTransaction(async txc => {
    const result = await txc.run('MATCH (a) where a.email = $email RETURN a,ID(a)', {email: email})

    if (result.records.length == 0) {
      return null
    }

    const singleRecord = result.records[0]
    const user = singleRecord.get(0)
    const userId = singleRecord.get(1).low;

    return {...user.properties, id: userId}
  });
}

