export const neo4j = require('neo4j-driver');
export const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "gogi"))

const REDIS_PORT = 6379;
export const redis = require('redis');

export const createClient = context => {
  if(context.redisClient) {
    return context.redisClient;
  } else {
    context.redisClient = redis.createClient(REDIS_PORT);
    return context.redisClient;
  }
}

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
export const USER_THEME_LIKES = 'Likes_Theme'
export const USER_ESSAY = 'Wrote'
export const USER_ESSAY_LIKES = 'Likes_Essay'
export const USER_HABIT = "Builds"
export const THEME_ESSAY = 'Has'
export const THEME_TAG = 'Tagged'
export const HABIT_TAG = 'Tagged'
export const HABIT_COMPLETED = 'Completed'
export const USER_NOTIFICATION = 'Notified'
