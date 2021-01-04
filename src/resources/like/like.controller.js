import * as likeRepository from './like.repository'
import {respondSuccess} from "../../helpers/response";
import {getSession} from "../../utils/db";



export const likeTheme = async (req, res) => {

  const themeId = req.params.themeId
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
  const result = await likeRepository.userLikesEssay(getSession(req), req.user.id, essayId)
  return respondSuccess(res, null, 200)
}

export const unLikeEssay = async (req, res) => {

  const essayId = req.params.essayId
  const result = await likeRepository.deleteUserLikesEssay(getSession(req), req.user.id, essayId)
  return respondSuccess(res, null, 200)
}

