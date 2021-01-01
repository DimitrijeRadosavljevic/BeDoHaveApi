import * as essayRepository from './essay.repository'
import { userOwnsTheme } from '../theme/theme.repository'
import { Essay } from "./essay.model";
import {getSession} from "../../utils/db";
import {respondError, respondSuccess} from "../../helpers/response";
import { validationResult} from "express-validator";


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

  const usersTheme = await userOwnsTheme(getSession(req), req.user.id, themeId)
  if (!usersTheme) respondError(res, null, 401)

  let essay = new Essay(null, req.body.title, req.body.content, req.body.date);
  essay = await essayRepository.postEssay(getSession(req), essay, themeId)
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
  getEssay,
  postEssay,
  putEssay,
  deleteEssay,
  validateEssay
}
