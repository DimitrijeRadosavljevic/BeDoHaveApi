import * as essayRepository from './essay.repository'
import { Essay } from "./essay.model";
import {getSession} from "../../utils/db";
import {respondSuccess} from "../../helpers/response";


const getEssays = async (req, res) => {

  // TODO (check if theme id exists in req)
  // TODO (check if that is his theme)
  const result = await essayRepository.getEssays(getSession(req), req.params.themeId, req.params.perPage || 10, req.params.page || 1);
  return respondSuccess(res, result, 200)
}

const getEssay = async (req, res) => {

  // TODO (check if that is his essay)
  const essay = await essayRepository.getEssay(getSession(req), req.params.essayId);
  return respondSuccess(res, essay, 200)
}

const postEssay = async (req, res) => {

  // TODO (check if that is his theme)
  // TODO (validate essay)
  let essay = new Essay(null, req.body.title, req.body.content, req.body.date);
  essay = await essayRepository.postEssay(getSession(req), essay, req.params.themeId)
  return respondSuccess(res, essay, 201)
}

const putEssay = async (req, res) => {

  // TODO (check if that is his essay)
  // TODO (validate essay)
  const essayHelper = new Essay(req.body.id, req.body.title, req.body.content, req.body.date);
  const essay = await essayRepository.putEssay(getSession(req), essayHelper)
  return respondSuccess(res, essay, 200)
}

const deleteEssay = async (req, res) => {

  // TODO (check if that is his essay)
  const essay = await essayRepository.deleteEssay(getSession(req), req.params.essayId);
  return respondSuccess(res, null, 204)
}


export const essayController = {
  getEssays,
  getEssay,
  postEssay,
  putEssay,
  deleteEssay
}
