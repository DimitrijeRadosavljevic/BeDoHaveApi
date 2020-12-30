import * as essayRepository from './essay.repository'
import { Essay } from "./essay.model";
import {getSession} from "../../utils/db";


const getEssays = async (req, res) => {

  // TODO (check if theme id exists in req)
  // TODO (check if that is his theme)
  const essays = await essayRepository.getEssays(getSession(req), req.params.themeId);
  return res.status(200).send(essays)
}

const getEssay = async (req, res) => {

  // TODO (check if that is his essay)
  const essay = await essayRepository.getEssay(getSession(req), req.params.essayId);
  return res.status(200).send(essay)
}

const postEssay = async (req, res) => {

  // TODO (check if that is his theme)
  // TODO (validate essay)
  const essayHelper = new Essay(req.body.title, req.body.content, req.body.date);
  const essay = await essayRepository.postEssay(getSession(req), req.params.themeId, essayHelper)
  return res.status(201).send(essay)
}

const putEssay = async (req, res) => {

  // TODO (check if that is his essay)
  // TODO (validate essay)
  const essayHelper = new Essay(req.body.title, req.body.content, req.body.date);
  const essay = await essayRepository.putEssay(getSession(req), essayHelper)
  return res.status(200).send(essay)
}

const deleteEssay = async (req, res) => {

  // TODO (check if that is his essay)
  const essay = await essayRepository.deleteEssay(getSession(req), req.params.essayId);
  return res.status(204).end()
}


export const essayController = {
  getEssays,
  getEssay,
  postEssay,
  putEssay,
  deleteEssay
}
