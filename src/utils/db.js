export const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "bedohave"))

export const getSession = context => {
  if (context.neo4jSession) {
    return context.neo4jSession
  }
  else {
    context.neo4jSession = driver.session()
    return context.neo4jSession
  }
}
