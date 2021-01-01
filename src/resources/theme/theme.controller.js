import * as themeRepository from "./theme.repository"
import { getSession } from "../../utils/db"
import {respondError, respondSuccess} from "../../helpers/response";
import {Theme} from "./theme.model";

export const getThemes = async (req, res) => {

    const themes = await themeRepository.getThemes(getSession(req), req.params.userId);
    res.status(200).send(themes);

} 

export const getTheme = async (req, res) => {

    const theme = await themeRepository.getTheme(getSession(req), req.params.userId, req.params.themeId);
    if(theme != null)
        res.status(200).send(theme);
    else 
        res.status(404).send("Not found");

}

export const postTheme = async (req, res) => {

    let theme = new Theme(null, req.body.title, req.body.description, req.body.date, req.body.reminder)
    theme = await themeRepository.postTheme(getSession(req), req.body, req.user.id);
    if(theme != null)
        return respondSuccess(res, theme, 201)

    // TODO handle error GOGI

}

export const deleteTheme = async (req, res) => {

    const theme = await themeRepository.deleteTheme(getSession(req), req.params.userId, req.params.themeId)
    if(theme != null) 
        res.status(204).end();
    else 
        res.status(404).send("Not Found")
}

export const putTheme = async (req, res) => {

    const theme = await themeRepository.putTheme(getSession(req), req.params.userId, req.params.themeId, req.body)
    if(theme != null)
        res.status(200).send(theme)
    else 
        res.status(404).send("Not Found")
}
