import { int, Integer } from "neo4j-driver";
import { driver, neo4j } from "../../utils/db"
import { Theme } from "./theme.model"


exports.getThemes = async (session, id) => {
    console.log(id);
        return session.readTransaction( async txc => {
        const result = await txc.run(
            'MATCH (p:User)--(c:Theme) where ID(p) = $id RETURN c,ID(c)',
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

exports.getTheme = async (session, userId, themeId) => {

    return session.readTransaction( async txc => {
        const result = await txc.run(
            'MATCH (a:Theme)--(c:User) where ID(a) = $themeId and ID(c) = $userId RETURN a,ID(a)',
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
        return { ...theme, id: Id }
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
                scheduleAnswer: null
            }
        )

        if (result.records.length == 0) {
          return null;
        }
        const themeResult = result.records[0].get('theme')

        const relationship = await txc.run(
          'MATCH (user:User), (theme:Theme) ' +
          'WHERE ID(user)=$userId and ID(theme)=$themeId ' +
          'CREATE (user)-[relationship:Write]->(theme) ' +
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
            'CREATE (theme)-[relationship:Tagged]->(tag) ' +
            'RETURN relationship',
            {
              themeId: themeResult.identity,
              tagId: neo4j.int(tag.id)
            }
          )

          if(theme.tags.length > 0) {
            if(relationship.records.length == 0) {
              return null
            }
          }
        })

        return { ...themeResult.properties, id: themeResult.identity.toString(), tags: theme.tags }
    })
}

exports.putTheme = async (session, userId, themeId, theme) => {

    return session.writeTransaction(async txc => {
        const result = await txc.run(
            'MATCH (a:Theme)--(c:User) where ID(a) = $themeId and ID(c) = $userId SET a.date = $date, a.description = $description, a.title = $title RETURN a,ID(a)',
            {
                themeId: neo4j.int(themeId),
                userId: neo4j.int(userId),
                date: theme.date,
                description: theme.description,
                title: theme.title
            }
        )

        if(result.records.length == 0) {
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
            'MATCH (theme:Theme)--(essay:Essay) where ID(theme)=$themeId DETACH DELETE essay RETURN ID(essay) ',
            {
                themeId: neo4j.int(themeId)
            }
        )

        const result = await txc.run(
            'MATCH (theme:Theme)--(user:User) where ID(theme) = $themeId and ID(user) = $userId DETACH DELETE theme RETURN theme,ID(theme)',
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
      'MATCH (user:User)-[relationship:Write]->(theme:Theme) ' +
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
export const getThemesPaginate = async (session, userId, perPage, page) => {
    return session.readTransaction(async txc => {
      const result = await txc.run(
        'MATCH (user:User)--(theme:Theme) ' +
        'WHERE ID(user) = $userId ' +
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
    });
  }
