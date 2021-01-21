import * as themeRepository from "./theme.repository"
import { createClient, getSession } from "../../utils/db"
import {respondError, respondSuccess} from "../../helpers/response";
import {Theme} from "./theme.model";
import { validationResult } from   "express-validator";
import { getThemeTags } from "../tag/tag.repository";
import * as essayRepository from "../essay/essay.repository";
import {doesUserLikesTheme} from "../like/like.repository";
import { trimSingleQuotes } from "tslint/lib/utils";
import { io, soketId } from "../../server";
import { postNotification } from "../notification/notification.repository";
import * as notificationRedis from "../notificationSystem/notificationRedis"

export const getThemes = async (req, res) => {

    const themes = await themeRepository.getThemes(getSession(req), req.user.id);
    res.status(200).send(themes);

} 

export const getTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, 'Theme id is required', 400);

    const usersTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId)
    if(!usersTheme) return respondError(res, null, 401);

    
    let returnTags = false;//Check if a theme has tag, if have return if not do not search for them
    if(req.query.tags) {
        let tags = await getThemeTags(getSession(req), req.params.themeId);
        if( tags[0] == null)
            returnTags = false;
        else 
            returnTags = true;
    }
    const theme = await themeRepository.getTheme(getSession(req), req.user.id, req.params.themeId, returnTags);
    if(theme != null)
       return respondSuccess(res, theme, 200);
    else 
        return respondError(res, "Not found", 404);

}

export const postTheme = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        respondError(res, errors.array(), 400)
    }
    let theme = new Theme(null, req.body.title, req.body.description, req.body.date, req.body.reminder, req.body.tags, req.body.scheduleAnswer)
    theme = await themeRepository.postTheme(getSession(req), theme, req.user.id);
    if(theme != null)
        return respondSuccess(res, theme, 201);
    else 
        return respondError(res, "Theme not created", 400);
}

export const deleteTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, "Theme id is reqired");

    const usersTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId)
    if(!usersTheme) return respondError(res, null, 401);

    const theme = await themeRepository.deleteTheme(getSession(req), req.user.id, req.params.themeId)
    if(theme != null) 
        return respondSuccess(res, null, 204);
    else 
        return respondError(res, "Not faund", 404);
}

export const putTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, "Theme id is reqired");

    const themeFromDatabase = await themeRepository.themeExist(getSession(req), themeId);
    if(themeFromDatabase == null) return respondError(req, "Theme not exist", 404);

    const usersTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId)
    if(!usersTheme) return respondError(res, null, 401);

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        respondError(res, errors.array(), 400)
    }
    
    let tagNames = "";
    req.body.tags.forEach(tag => {
        tagNames += tag.name;
    });
    console.log(tagNames);
    console.log(JSON.stringify(themeFromDatabase));
    await themeRepository.removeThemeFromRandomChoice(createClient(req), themeFromDatabase);
    const theme = await themeRepository.putTheme(getSession(req), req.user.id, req.params.themeId, req.body, tagNames)
    if(theme != null)
        respondSuccess(res, theme, 200);
    else 
       respondError(res, "Not found", 404);
}

export const getThemeForSpecificUpdate = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, 'Theme id is required', 400);

    const theme = await themeRepository.getThemeForSpecificUpdate(getSession(req), themeId);
    if(theme != null) 
       return respondSuccess(res, theme, 200);
    else 
        return respondError(res, "Not found", 404);

}

export const getThemesPaginate = async (req, res) => {
    //io.sockets.emit('69Notification', "Slovca354");
    //const notification = await postNotification(getSession(req), "66", "354");
    const theme = await themeRepository.getThemesPaginate(getSession(req), req.user.id, req.query.perPage || 6, req.query.page || 1, req.query.title, req.query.tags, req.query.filterOverdueThemesDate);
    return respondSuccess(res, theme, 200)
}

export const getThemePublic = async (req, res) => {
    // TODO check if theme is public
    const themeId = req.params.themeId
    const theme = await themeRepository.getThemeDetail(getSession(req), themeId)
    theme.likersCount = await themeRepository.getLikersCount(getSession(req), themeId)
    theme.likedByUser = await doesUserLikesTheme(getSession(req), req.user.id, themeId)

    const redisClient = createClient(req)
    theme.tags.forEach(tag => {
        redisClient.zincrby(`users:${req.user.id}:tags`, 1, tag.id)
    });

    return respondSuccess(res, theme, 200)
}

export const getOverdueThemes = async (req, res) => {

    const overdueThemes = await themeRepository.getOverdueThemes(getSession(req), req.user.id, req.query.currentDate);
    return respondSuccess(res, overdueThemes, 200);
}

export const publishTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, "Theme id is reqired");

    const userTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId);
    if(!userTheme) return respondError(res, "Unauthorized", 401);

    const theme = await themeRepository.publishTheme(getSession(req), req.user.id, req.body);
    console.log(theme);
    if(theme != null) {
        if(theme.public == true) {
            await themeRepository.addThemeForRandomChoice(createClient(req), theme);
            console.log("Tema dodata", theme.public);
        } else {
            let themeForDelete = theme;
            themeForDelete.public = true;
            await themeRepository.removeThemeFromRandomChoice(createClient(req), themeForDelete);
            console.log("Tema izbrisana", theme.public);
        }
        return respondSuccess(res, theme, 200);
    } else {
        return respondError(res, theme, 404);
    }
}

export const getPublicThemes = async (req, res) => {
    const publicThemes = await themeRepository.getPublicThemes(getSession(req), req.query.perPage || 6, req.query.page || 1, req.query.title, req.query.tags)
;
    // const allPublicThemes = await themeRepository.getAllPublicThemes(getSession(req));
    // const client = createClient(req);
    // const response = await client.rpush('publicThemes', JSON.stringify(...allPublicThemes.themes));
    //                  await client.expire('publicThemes', 3600);
    // const response2 = await client.set('totalPublicThemes', allPublicThemes.themes.length);
    //                   await client.expire('totalPublicThemes', 3600);
    // const themes = await themeRepository.getPublicThemesRedis(client, parseInt(req.query.perPage), parseInt(req.query.page));

    // console.log("Neo4j");
    return respondSuccess(res, publicThemes, 200);
}

export const updateThemeScheduleAnswer = async (req, res) => {
    console.log("Tema");
    const theme = await themeRepository.updateThemeScheduleAnswer(getSession(req), req.user.id, req.params.themeId, req.body.scheduleAnswer);
    if(theme != null)
        return respondSuccess(res, theme, 201);
    else 
        return respondError(res, "Theme not updated", 500);
}

export const getPublicThemesRedis = async (req, res, next) => {

    const publicThemes = await themeRepository.getPublicThemesRedis(createClient(req), parseInt(req.query.perPage), parseInt(req.query.page));
    if(publicThemes.themes.length != 0) {
        console.log(publicThemes, "Redis");
        return respondSuccess(res, publicThemes, 200)
    } else {
        next();
    }
}

export const getPersonalizedThemes = async (req, res) => {
    const redisClient = createClient(req)

    return redisClient.zrange(`users:${req.user.id}:tags`, 0, -1, async (err, items) => {
        const data = await themeRepository.getPersonalizedThemes(getSession(req), items, req.query.page, req.query.perPage)

        // return res.send(data);
        return respondSuccess(res, data, 200)
    })
}

export const getRandomTheme = async (req, res) => {

    const randomTheme = await themeRepository.getRandomTheme(createClient(req));
    console.log(randomTheme);
    return respondSuccess(res, randomTheme, 200);
}

export const getNumberOfRandomThemes = async (req, res) => {

    const numberOfRandomThemes = await themeRepository.getNumberOfRandomThemes(createClient(req));
    console.log(numberOfRandomThemes);
    return respondSuccess(res, numberOfRandomThemes, 200);
}

export const subscribeOnTheme = async (req, res) => {

    if(!req.query.themeId) {
        const client = createClient(req);
        client.sadd(req.body.id, req.user.id + 'Notification', (err, subscriber) => {
            if(err) console.log(err);
        });
        return respondSuccess(res, 'Subscribed', 200);
    } else {
        const themeId = req.query.themeId;
        const client = createClient(req);
        client.sismember(themeId, req.user.id + 'Notification', (err, response) => {
        if(err) console.log(err);

        return respondSuccess(res, response, 200);
        })
    }
}

export const unsubscribeFromTheme = async (req, res) => {

    const client = createClient(req);
    client.srem( req.body.id,  req.user.id + 'Notification', (err, subscriber) => {
        if(err) console.log(err);
    })
    return respondSuccess(res, "Unsubscribed", 200);
}

export const getNotificationsFromRedis = async (req, res) => {

    const client = createClient(req);
    client.lrange(req.user.id + 'Notification' + ':subscribedThemes', 0, -1, (err, notifications) => {
        if(err) console.log(err);
        const notificationsFromDatabase = []
        if(notifications) {
            notifications.forEach(notification => {
                notificationsFromDatabase.push(JSON.parse(notification))
            })
        }
        return respondSuccess(res, notificationsFromDatabase, 200);
    })
}

export const deleteNotificationsRedis  = async (req, res) => {

    const client = createClient(req);
    client.del(req.user.id + 'Notification' + ':subscribedThemes', (err, notifications) => {
        if(err) console.log(err);

        return respondSuccess(res, "Notifications deleted" , 200);
    })
}

export const checkSubscriptionOnThemeRedis  = async (req, res) => {

    const themeId = req.query.themeId;
    const client = createClient(req);
    client.sismember(themeId, /*req.user.id*/27 + 'Notification', (err, response) => {
        if(err) console.log(err);

        console.log(response);
        return respondSuccess(res, "Notifications deleted" , 200);
    })
}



export const validateTheme = {
    title: {
      in: ['body'],
      isLength: {
        errorMessage: 'Title must have at least one character',
        options: { min: 1 }
      }
    },
    date: {
      in: ['body'],
      isDate: {
        errorMessage: 'Parameter date must be of type Date'
      }
    }
    // scheduleAnswer: {
    //     in: ['body'],
    //     isDate: {
    //         errorMessage: 'ScheduleAnswer must be type Date',
    //     }
    //}
  }



