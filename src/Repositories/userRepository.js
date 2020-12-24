//const neo4j = require('neo4j-driver');
//const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "gogi"));

import { driver } from "../utils/db"


const personName = 'Slovca354Osoba2';

exports.createPerson = async () => {

    try {
    const result = await session.run(
        'CREATE (a:Person {name: $name}) RETURN a',
        { name: personName }
    )

    const singleRecord = result.records[0]
    const node = singleRecord.get(0)

    console.log(node.properties.name)
    return ( node.properties.name)
    } finally {

    await session.close();

    }

    // on application exit:
    await driver.close()
    //return node.properties.name;
}

//exports.createPerson354 = 
exports.createPerson354 = async (personName354) =>  {
    const session = driver.session()
    const result = await session.run(
        'CREATE (a:Person {name: $name}) RETURN a',
        { name: personName354 }
    )

    //console.log(result);


     const singleRecord = result.records[0]
     const node = singleRecord.get(0)

     await session.close();
     return node.properties.name;
}

exports.createPersonSigurna = async function (name)  {
    let session = driver.session();
    let user = "No user has created";
    try {
        user = await session.run('MERGE (p:Person { name: $name}) RETURN p',{
            name: name
        });
    }
    catch(error) {
        console.error(error);
        return user;
    }

    return user.records[0].get(0).properties.name;
}