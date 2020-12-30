import * as themeRepository from "./theme.repository"
import { getSession } from "../../utils/db"

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

    const theme = await themeRepository.postTheme(getSession(req), req.body, req.params.userId);
    if(theme != null)
        res.status(200).send(theme);
    else 
        res.status(404).send("Error");

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