import * as themeRepository from "./theme.repository"
import { getSession } from "../../utils/db"
import {respondError, respondSuccess} from "../../helpers/response";
import {Theme} from "./theme.model";
import { validationResult } from   "express-validator";

export const getThemes = async (req, res) => {

    const themes = await themeRepository.getThemes(getSession(req), req.user.id);
    res.status(200).send(themes);

} 

export const getTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, 'Theme id is required', 400);

    const usersTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId)
    if(!usersTheme) return respondError(res, null, 401);

    const theme = await themeRepository.getTheme(getSession(req), req.user.id, req.params.themeId);
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
    let theme = new Theme(null, req.body.title, req.body.description, req.body.date, req.body.reminder, req.body.tags)
    theme = await themeRepository.postTheme(getSession(req), theme, req.user.id);
    if(theme != 1 && theme !=2)
        return respondSuccess(res, theme, 201);
    else if (theme == 1)
        return respondError(res, "Theme not created", 400)  
    else 
        return respondError(res, "Relationship not created", 400)
}

export const deleteTheme = async (req, res) => {

    const themeId = req.params.themeId;
    if(!themeId) respondError(res, "Theme id is reqired");

    const usersTheme = await themeRepository.userOwnsTheme(getSession(req), req.user.id, themeId)
    if(!usersTheme) return respondError(res, null, 401);

    const theme = await themeRepository.deleteTheme(getSession(req), req.user.id, req.params.themeId)
    if(theme != null) 
        return respondSuccess(res, null, 201);
    else 
        return respondError(res, "Not faund", 404);
}

export const putTheme = async (req, res) => {

    const theme = await themeRepository.putTheme(getSession(req), req.user.id, req.params.themeId, req.body)
    if(theme != null)
        res.status(200).send(theme)
    else 
        res.status(404).send("Not Found")
}


export const getThemesPaginate = async (req, res) => {

    const theme = await themeRepository.getThemesPaginate(getSession(req), req.user.id, req.query.perPage || 6, req.query.page || 1);
    return respondSuccess(res, theme, 200)
}
