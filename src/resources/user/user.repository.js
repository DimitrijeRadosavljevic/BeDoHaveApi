import { driver, neo4j } from "../../utils/db"
import { User } from "./user.model"

//post user
exports.postUser = async (user) =>  {

    const session = driver.session()
    const result = await session.run(
        'CREATE (a:Person {name: $name, email: $email, password: $password}) RETURN a,ID(a)',
        { 
          name: user.name,
          email: user.email,
          password: user.password 
        }
    )

     const singleRecord = result.records[0]
     const node = singleRecord.get(0)
     const nodeId = singleRecord.get(1).low;
     //console.log(node.identity);

     await session.close();
     return { user: node.properties, id: nodeId }
}

//get user
exports.getUser = async (id) => {

    const session = driver.session()
    const result = await session.run(
        'MATCH (a) where ID(a) = $id RETURN a,ID(a)',
        {
            id: neo4j.int(id)
        }
    )

    const singleRecord = result.records[0]
    const node = singleRecord.get(0)
    const nodeId = singleRecord.get(1).low;
    //console.log(nodeId);
    await session.close();
    //console.log(singleRecord);
    return { user: node.properties, id: nodeId }

}

exports.getUserByEmail = async (email) => {

  const session = driver.session()
  const result = await session.run(
    'MATCH (a) where a.email = $email RETURN a,ID(a)',
    {
      email: email.toString()
    }
  )

  const singleRecord = result.records[0]
  const user = singleRecord.get(0)
  const userId = singleRecord.get(1).low;
  await session.close();
  return { user: user.properties, id: userId }
}

