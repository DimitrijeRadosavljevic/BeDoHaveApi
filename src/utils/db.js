export const neo4j = require('neo4j-driver');
export const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "gogi"));