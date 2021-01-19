import * as likeRepository from './like.repository'
import * as themeRepository from "../theme/theme.repository"
import * as notificationSystem from "../notificationSystem/notificationRedis"
import * as essayRepository from "../essay/essay.repository"
import {respondError, respondSuccess} from "../../helpers/response";
import {createClient, getSession} from "../../utils/db";



export const likeTheme = async (req, res) => {

  const themeId = req.params.themeId

  const theme = await themeRepository.themeExist(getSession(req), themeId);
  if(theme == null) {
    return respondError(res, "Theme no longer exist", 404)
  }

  if(theme.public == false) {
    return respondError(res, "Theme is now private", 400);
  }

  const themeOwner = await themeRepository.themeOwner(getSession(req), themeId);
  if(themeOwner.id != req.user.id) {
    notificationSystem.publishOnChanel(createClient(req), themeOwner.id, `User: ${req.user.email} likes your theme: ${theme.title}`);
  }
  const result = await likeRepository.userLikesTheme(getSession(req), req.user.id, themeId)
  return respondSuccess(res, null, 200)
}

export const unLikeTheme = async (req, res) => {

  const themeId = req.params.themeId
  const result = await likeRepository.deleteUserLikesTheme(getSession(req), req.user.id, themeId)
  return respondSuccess(res, null, 200)
}

export const likeEssay = async (req, res) => {

  const essayId = req.params.essayId

  const essay = await essayRepository.essayExist(getSession(req), essayId);
  if(essay == null) {
    return respondError(res, "Essey no longer exist", 404);
  }

  const essayOwner = await essayRepository.essayOwner(getSession(req), essayId);
  if(essayOwner.id != req.user.id) {
    notificationSystem.publishOnChanel(createClient(req), essayOwner.id, `User: ${req.user.email} liked your essay: ${essay.title}`);
  }

  const result = await likeRepository.userLikesEssay(getSession(req), req.user.id, essayId)
  return respondSuccess(res, null, 200)
}

export const unLikeEssay = async (req, res) => {

  const essayId = req.params.essayId
  const result = await likeRepository.deleteUserLikesEssay(getSession(req), req.user.id, essayId)
  return respondSuccess(res, null, 200)
}

