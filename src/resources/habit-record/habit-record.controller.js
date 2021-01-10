import * as habitRecordRepository from "./habit-record.repository";
import {getSession} from "../../utils/db";
import {respondError, respondSuccess} from "../../helpers/response";
import {validationResult} from "express-validator";
import {HabitRecord} from "./habit-record.model";


const getHabitRecords = async (req, res) => {

  const result = await habitRecordRepository.getHabitRecords(getSession(req), req.params.habitId, req.query.perPage || 10, req.query.page || 1);
  return respondSuccess(res, result, 200)
}

const postHabitRecord = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  let record = new HabitRecord(null, req.body.date, req.body.comment, req.body.status);
  record = await habitRecordRepository.postHabitRecord(getSession(req), req.params.habitId, record)
  return respondSuccess(res, record, 201)
}

const putHabitRecord = async (req, res) => {

  // const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  // if (!usersEssay) respondError(res, null, 401)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  const habitRecordHelper = new HabitRecord(req.body.id, req.body.date, req.body.comment, req.body.status);
  const record = await habitRecordRepository.putHabitRecord(getSession(req), habitRecordHelper)
  return respondSuccess(res, record, 200)
}

const deleteHabitRecord = async (req, res) => {

  const habitRecordId = req.params.habitRecordId
  // TODO do auth in other way
  // const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  // if (!usersEssay) respondError(res, null, 401)

  const result = await habitRecordRepository.deleteHabitRecord(getSession(req), habitRecordId);
  return respondSuccess(res, null, 204)
}

const validateRecord = {
  date: {
    in: ['body'],
    isDate: {
      errorMessage: 'Parameter date must be of type Date'
    }
  },
  status: {
    in: ['body'],
    isBoolean: {
      errorMessage: 'Status must be boolean',
    }
  }
}


export const habitRecordController = {
  getHabitRecords,
  postHabitRecord,
  putHabitRecord,
  deleteHabitRecord,
  validateRecord
}
