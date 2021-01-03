export const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "gogi"))

export const getSession = context => {
  if (context.neo4jSession) {
    return context.neo4jSession
  }
  else {
    context.neo4jSession = driver.session()
    return context.neo4jSession
  }
}

export const USER_THEME = 'Owns'
export const USER_ESSAY = 'Wrote'
export const THEME_ESSAY = 'Has'
export const THEME_TAG = 'Tagged'
