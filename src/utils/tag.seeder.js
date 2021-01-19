import {driver} from "./db";

export const seedTags = async () => {

  const session = driver.session()

  const tags = [
    'music', 'hiphop', 'rap', 'dance', 'guitar', 'classic-music', 'rock', 'folk',
    'programming', 'coding', 'programmer', 'developer', 'python', 'technology', 'javascript', 'code', 'coder', 'java',
    'computerscience', 'html', 'webdeveloper', 'tech', 'css', 'software', 'webdevelopment', 'codinglife', 'linux', 'programmingmemes',
    'softwaredeveloper', 'programmers', 'webdesign', 'programminglife', 'hacking', 'machinelearning', 'php', 'computer',
    'databases', 'health', 'fitness', 'healthylifestyle', 'motivation', 'wellness', 'healthy', 'love', 'workout', 'lifestyle', 'gym', 'fit', 'training',
    'fitnessmotivation', 'life', 'instagood', 'nutrition', 'bodybuilding', 'exercise', 'fitfam', 'weightloss', 'beauty', 'healthyfood',
    'selfcare', 'bhfyp', 'healthyliving', 'inspiration', 'happy', 'happiness', 'bhfyp'
  ]

  const numberOfTags = await session.readTransaction(async txc => {
    const result = await  txc.run('MATCH (tag:Tag) RETURN count(tag) as count')
    return result.records[0].get('count').toString()
  });

  if (numberOfTags != tags.length) {
    session.writeTransaction(async txc => {
      tags.forEach(tag => {
        txc.run('CREATE (tag:Tag { name: $name })', {name: tag})
      })
    });
  }
}


