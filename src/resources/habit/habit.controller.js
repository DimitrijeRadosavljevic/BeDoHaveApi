import * as habitRepository from "./habit.repository";
import {getSession} from "../../utils/db";
import {respondError, respondSuccess} from "../../helpers/response";
import {validationResult} from "express-validator";
import {Habit} from "./habit.model";


const getHabits = async (req, res) => {

  const result = await habitRepository.getHabits(getSession(req), req.user.id, req.query.perPage || 10, req.query.page || 1);
  return respondSuccess(res, result, 200)
}


const getHabit = async (req, res) => {

  const habitId = req.params.habitId
  // TODO do authorization in other way
  // const usersHabit = await habitRepository.userOwnsHabit(getSession(req), req.user.id, habitId)
  // if (!usersHabit) respondError(res, null, 401)

  const habit = await habitRepository.getHabit(getSession(req), habitId);
  return respondSuccess(res, habit, 200)
}

const postHabit = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  let habit = new Habit(null, req.body.name, req.body.description, req.body.frequency, req.body.frequencySpecific, req.body.tags);
  habit = await habitRepository.postHabit(getSession(req), req.user.id, habit)
  return respondSuccess(res, habit, 201)
}

const putHabit = async (req, res) => {

  const habitId = req.params.habitId
  // TODO do authorization in other way
  // const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  // if (!usersEssay) respondError(res, null, 401)
  console.log('Hi')
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  const habitHelper = new Habit(req.body.id, req.body.name, req.body.tags);
  const habit = await habitRepository.putHabit(getSession(req), habitHelper)
  return respondSuccess(res, habit, 200)
}

const deleteHabit = async (req, res) => {

  const habitId = req.params.habitId
  // TODO do auth in other way
  // const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  // if (!usersEssay) respondError(res, null, 401)

  const habit = await habitRepository.deleteHabit(getSession(req), habitId);
  return respondSuccess(res, null, 204)
}

const validateHabit = {
  name: {
    in: ['body'],
    isLength: {
      errorMessage: 'Name must have at least one character',
      options: { min: 1 }
    }
  }
}


export const habitController = {
  getHabits,
  getHabit,
  postHabit,
  putHabit,
  deleteHabit,
  validateHabit
}
