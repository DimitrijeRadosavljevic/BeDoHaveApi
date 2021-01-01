import { int, Integer } from "neo4j-driver";
import { driver, neo4j } from "../../utils/db"
import { Theme } from "./theme.model"


exports.getThemes = async (session, id) => {

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

        return { themes: allThemes }
        
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
        const Id = singleRecord.get(1).low
        return { ...theme, id: Id }
    }) 
}

exports.postTheme = async (session, theme, userId) => {

    return session.writeTransaction( async txc => {
        const result = await txc.run(
          'CREATE (theme:Theme {title: $title, description: $description, date: $date}) ' +
          'RETURN theme',
            {
                title: theme.title,
                description: theme.description,
                date: theme.date
            }
        )

        if (result.records.length == 0) {
          // TODO handle error GOGI
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
            // TODO handle error GOGI
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

          if(relationship.records.length == 0) {
            // TODO handle error GOGI
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
        const Id = singleRecord.get(1).low
        return { ...themeFromDatabase, id: Id }
    })
}

exports.deleteTheme = async (session, userId, themeId) => {

    const result = await session.run(
        'MATCH (a:Theme)--(c:User) where ID(a) = $themeId and ID(c) = $userId DETACH DELETE a RETURN a,ID(a)',
        {
            themeId: neo4j.int(themeId),
            userId: neo4j.int(userId)
        }
    )

    await session.close();

    if(result.records.length == 0) {
         return null
    }
    const singleRecord = result.records[0]
    const theme = singleRecord.get(0).properties
    const Id = singleRecord.get(1).low
    return { Id: Id }
}
