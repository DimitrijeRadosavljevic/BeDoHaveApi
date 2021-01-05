import { forEach } from "lodash";
import { int, Integer } from "neo4j-driver";
import {driver, neo4j, THEME_TAG, USER_ESSAY_LIKES, USER_THEME, USER_THEME_LIKES} from "../../utils/db"
import { Theme } from "./theme.model"


exports.getThemes = async (session, id) => {
    console.log(id);
        return session.readTransaction( async txc => {
        const result = await txc.run(
            `MATCH (p:User)-[:${USER_THEME}]->(c:Theme) where ID(p) = $id RETURN c,ID(c)`,
            {
                id:  neo4j.int(id)
            }
        ) 
        
        let allThemes = new Array();
        result.records.forEach(element => {
            //allThemes.push(new Theme(element.get(0).properties.title, element.get(0).properties.description,element.get(0).properties.date, element.get(1).low));
            allThemes.push({ ...element.get(0).properties, id:element.get(1).low })
     });

        return { data: allThemes }
        
    })
}

exports.getTheme = async (session, userId, themeId, tags) => {

    return session.readTransaction( async txc => {
        const result = await txc.run(
            `MATCH ` +(tags ? `(tag:Tag)<-[:Tagged]-` : ``)+`(a:Theme)<-[:${USER_THEME}]-(c:User) where ID(a) = $themeId and ID(c) = $userId RETURN a,ID(a)`+(tags ? `,tag,ID(tag)`: ``),
            {
                themeId: neo4j.int(themeId),
                userId: neo4j.int(userId)
            }
        )

        if(result.records.length == 0) {
            return null
        }
        const singleRecord = result.records[0]
        const theme = singleRecord.get(0).properties
        const Id = singleRecord.get(0).identity.toString();
        let themeTags = new Array();
        if(tags) {
          result.records.forEach( record => {
            let tag = record.get('tag').properties;
            let tagId = record.get('tag').identity.toString();
            themeTags.push({ ...tag, id: tagId })
          })
        }
        return { ...theme, id: Id, tags: themeTags }
    }) 
}

exports.postTheme = async (session, theme, userId) => {

    return session.writeTransaction( async txc => {
        const result = await txc.run(
          'CREATE (theme:Theme {title: $title, description: $description, date: $date, reminder: $reminder, scheduleAnswer: $scheduleAnswer }) ' +
          'RETURN theme',
            {
                title: theme.title,
                description: theme.description,
                date: theme.date,
                reminder: theme.reminder,
                scheduleAnswer: theme.scheduleAnswer
            }
        )

        if (result.records.length == 0) {
          return null;
        }
        const themeResult = result.records[0].get('theme')

        const relationship = await txc.run(
          'MATCH (user:User), (theme:Theme) ' +
          'WHERE ID(user)=$userId and ID(theme)=$themeId ' +
          `CREATE (user)-[relationship:${USER_THEME}]->(theme) ` +
          'RETURN relationship',
            {
                userId: neo4j.int(userId),
                themeId: themeResult.identity
            }
        )

        if(relationship.records.length == 0) {
            return null;
        }

        theme.tags.map(async tag => {
          const relationship = await txc.run(
            'MATCH (theme:Theme), (tag:Tag) ' +
            'WHERE ID(theme)=$themeId and ID(tag)=$tagId ' +
            `CREATE (theme)-[relationship:${THEME_TAG}]->(tag) ` +
            'RETURN relationship',
            {
              themeId: themeResult.identity,
              tagId: neo4j.int(tag.id)
            }
          )
            if(relationship.recordslength == 0) {
              return null
            }
        })

        return { ...themeResult.properties, id: themeResult.identity.toString(), tags: theme.tags }
    })
}

exports.putTheme = async (session, userId, themeId, theme, tagNames) => {

    return session.writeTransaction(async txc => {
        const result = await txc.run(
            `MATCH (a:Theme)<-[${USER_THEME}]-(c:User) where ID(a) = $themeId and ID(c) = $userId SET a.date = $date, a.description = $description, a.title = $title, a.reminder = $reminder RETURN a,ID(a)`,
            {
                themeId: neo4j.int(themeId),
                userId: neo4j.int(userId),
                date: theme.date,
                description: theme.description,
                title: theme.title,
                reminder: theme.reminder
            }
        )

        if(result.records.length == 0) {
          return null
        }

        const response = await txc.run(
          `MATCH (theme:Theme)-[relationship:${THEME_TAG}]->() WHERE ID(theme)= $themeId DELETE relationship RETURN relationship`,
          {
            themeId: neo4j.int(themeId)
          }
        )

        // if(response.get('errors')){
        //   return null
        // }
          const newTags = await txc.run(
            `MATCH (theme:Theme), (tag:Tag) WHERE ID(theme)=$themeId and $tagNames CONTAINS tag.name CREATE (theme)-[relationship:${THEME_TAG}]->(tag) RETURN relationship`,
            {
              themeId: neo4j.int(themeId),
              tagNames: tagNames
            }
          )

          if(tagNames != "" && newTags.records.length == 0){
            return null
          }

        const singleRecord = result.records[0]
        const themeFromDatabase = singleRecord.get(0).properties
        const Id = singleRecord.get(0).identity.toString()
        return { ...themeFromDatabase, id: Id }
    })
}

exports.deleteTheme = async (session, userId, themeId) => {

    return session.writeTransaction(async txc => {
        
        const deleteEssays = await txc.run(
            `MATCH (theme:Theme)-[:${THEME_ESSAY}]->(essay:Essay) where ID(theme)=$themeId DETACH DELETE essay RETURN ID(essay) `,
            {
                themeId: neo4j.int(themeId)
            }
        )

        const result = await txc.run(
            `MATCH (theme:Theme)<-[:${USER_THEME}]-(user:User) where ID(theme) = $themeId and ID(user) = $userId DETACH DELETE theme RETURN theme,ID(theme)`,
                {
                    themeId: neo4j.int(themeId),
                    userId: neo4j.int(userId)
                }
        )

        if(result.records.length == 0) {
            return null
        }
        const singleRecord = result.records[0]
        const theme = singleRecord.get(0).properties
        const Id = singleRecord.get('theme').identity.toString();
        return { Id }
    })
}

exports.userOwnsTheme = async (session, userId, themeId) => {
  return session.readTransaction(async txc => {
    const result = await txc.run(
      `MATCH (user:User)-[relationship:${USER_THEME}]->(theme:Theme) ` +
      'WHERE ID(user) = $userId AND  ID(theme) = $themeId ' +
      'RETURN relationship',
      {
        userId: neo4j.int(userId),
        themeId: neo4j.int(themeId)
      }
    )

    return (result.records.length == 0 ? false : true)
  })
}
export const getThemesPaginate = async (session, userId, perPage, page, title, tags) => {
  
  return session.readTransaction(async txc => {
    if(!tags) {
      console.log(tags);
      console.log(title);
        const result = await txc.run(
        `MATCH (user:User)-[:${USER_THEME}]->(theme:Theme) ` +
        'WHERE ID(user) = $userId ' +
        'and theme.title CONTAINS $title '+
        'WITH collect(theme) as themes, count(theme) as total ' +
        'UNWIND themes as theme ' +
        'RETURN theme, total ' +
        'ORDER BY theme.date DESC ' +
        'SKIP $skip ' +
        'LIMIT $limit',
        {
          userId: neo4j.int(userId),
          skip: neo4j.int((page - 1) * perPage),
          limit: neo4j.int(perPage),
          title: (title ? title : ''),
        })

      if (result.records.length == 0) {
        return { themes: new Array, total: 0}
      }

      const themes = result.records.map(record => {
        const theme = record.get('theme')
        return {...theme.properties, id: theme.identity.toString()}
      })
      const total = parseInt(result.records[0].get('total').toString())
      return { themes, total}
    } else {
      console.log(tags);
      console.log(title);
        const result = await txc.run(
        `MATCH (user:User)-[:${USER_THEME}]->(theme:Theme)-[:${THEME_TAG}]->(tag:Tag) ` +
        'WHERE ID(user) = $userId ' +
        'and $tags CONTAINS tag.name ' +
        'and theme.title CONTAINS $title '+
        'WITH collect(theme) as themes, count(theme) as total ' +
        'UNWIND themes as theme ' +
        'RETURN DISTINCT theme, total ' +
        'ORDER BY theme.date DESC ' +
        'SKIP $skip ' +
        'LIMIT $limit',
        {
          userId: neo4j.int(userId),
          skip: neo4j.int((page - 1) * perPage),
          limit: neo4j.int(perPage),
          title: (title ? title : ''),
          tags: tags
        })

      if (result.records.length == 0) {
        return { themes: new Array, total: 0}
      }

      const themes = result.records.map(record => {
        const theme = record.get('theme')
        return {...theme.properties, id: theme.identity.toString()}
      })
      const total = parseInt(result.records[0].get('total').toString())
      return { themes, total}
    }
  });
}


// fetch theme, with owner
export const getThemeDetail = async (session, themeId) => {
  return session.readTransaction( async txc => {

    const result = await txc.run(
      `MATCH (user:User)-[:${USER_THEME}]->(theme:Theme) ` +
      'WHERE ID(theme) = $themeId ' +
      'RETURN user, theme',
      {
        themeId: neo4j.int(themeId)
      }
    )

    const theme = result.records[0].get('theme')
    const user = result.records[0].get('user')

    return {
      ...theme.properties,
      id: theme.identity.toString(),
      user: {
        ...user.properties,
        id: user.identity.toString()
      }
    }
  })
}

export const getLikersCount = (session, themeId) => {
  return session.readTransaction(async txc => {
    const likersResult = await txc.run(
      `MATCH (userLikesEssay:User)-[:${USER_THEME_LIKES}]->(theme:Theme) ` +
      'WHERE ID(theme) = $themeId ' +
      'WITH count(userLikesEssay) as likersCount ' +
      'RETURN likersCount',
      {
        themeId: neo4j.int(themeId)
      })

    return likersResult.records[0].get('likersCount').toString()
  })
}
