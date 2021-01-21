import * as essayRepository from './essay.repository'
import * as themeRepository from '../theme/theme.repository'
import * as notificationSystem from "../notificationSystem/notificationRedis"
import { userOwnsTheme } from '../theme/theme.repository'
import { Essay } from "./essay.model";
import {createClient, getSession} from "../../utils/db";
import {respondError, respondSuccess} from "../../helpers/response";
import { validationResult} from "express-validator";
import {doesUserLikesEssay} from "../like/like.repository";


const getEssays = async (req, res) => {

  const themeId = req.params.themeId;
  if (!themeId) respondError(res, 'Theme id is required', 400)

  const usersTheme = await userOwnsTheme(getSession(req), req.user.id, themeId)
  if (!usersTheme) respondError(res, null, 401)

  const result = await essayRepository.getEssays(getSession(req), req.params.themeId, req.params.perPage || 10, req.params.page || 1);
  return respondSuccess(res, result, 200)
}

const getEssay = async (req, res) => {

  const essayId = req.params.essayId
  const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  if (!usersEssay) respondError(res, null, 401)

  const essay = await essayRepository.getEssay(getSession(req), req.params.essayId);
  return respondSuccess(res, essay, 200)
}

const postEssay = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  const themeId = req.params.themeId;
  if (!themeId) respondError(res, 'Theme id is required', 400)

  const theme = await  themeRepository.themeExist(getSession(req), themeId);
  if(theme == null) {
     return respondError(res, "Theme not exist", 404);
  }

  const themeOwner = await themeRepository.themeOwner(getSession(req), themeId);
  if(themeOwner.id != req.user.id && theme.public == false) {
    return respondError(res, "Theme is now private", 400);
  } 
  if(themeOwner.id != req.user.id) {
    notificationSystem.publishOnChanel(createClient(req), themeOwner.id, `User:${req.user.email} write on your theme ${theme.title}`);
  }
  let essay = new Essay(null, req.body.title, req.body.content, req.body.date);
  essay = await essayRepository.postEssay(getSession(req), req.user.id, themeId, essay)
  return respondSuccess(res, essay, 201)
}

const putEssay = async (req, res) => {

  const essayId = req.params.essayId
  const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  if (!usersEssay) respondError(res, null, 401)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  const essayHelper = new Essay(req.body.id, req.body.title, req.body.content, req.body.date);
  const essay = await essayRepository.putEssay(getSession(req), essayHelper)
  return respondSuccess(res, essay, 200)
}

const deleteEssay = async (req, res) => {

  const essayId = req.params.essayId
  const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  if (!usersEssay) respondError(res, null, 401)

  const essay = await essayRepository.deleteEssay(getSession(req), essayId);
  return respondSuccess(res, null, 204)
}

const getEssayDetail = async (req, res) => {

  const essayId = req.params.essayId

  const essay = await essayRepository.getEssayDetail(getSession(req), essayId);
  essay.likersCount = await essayRepository.getEssayLikersCount(getSession(req), essayId);
  essay.likedByUser = await doesUserLikesEssay(getSession(req), req.user.id, essayId);
  essay.ownedByUser = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId);

  return respondSuccess(res, essay, 200)
}

// returns essays and users that wrote them
const getEssaysPublic = async (req, res) => {

  // Check if theme is public
  const themeId = req.params.themeId
  const essays = await essayRepository.getEssaysWithUser(getSession(req), themeId, req.query.perPage, req.query.page)

  respondSuccess(res, essays, 200)
}

const validateEssay = {
  title: {
    in: ['body'],
    isLength: {
      errorMessage: 'Title must have at least one character',
      options: { min: 1 }
    }
  },
  content: {
    in: ['body'],
    isLength: {
      errorMessage: 'Content must have at least one character',
      options: { min: 1 }
    }
  },
  date: {
    in: ['body'],
    isDate: {
      errorMessage: 'Parameter date must be of type Date'
    }
  }
}



export const essayController = {
  getEssays,
  getEssaysPublic,
  getEssay,
  getEssayDetail,
  postEssay,
  putEssay,
  deleteEssay,
  validateEssay
}
