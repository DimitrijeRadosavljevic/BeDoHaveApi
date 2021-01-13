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

  const habit = await habitRepository.getHabit(getSession(req), habitId)
  switch (habit.frequency) {
    case 'daily':
      habit.statistics = await habitRepository.getDailyStatistics(getSession(req), habitId, new Date(habit.date))
      break;
    case 'per-week':
      habit.statistics = await habitRepository.getWeeklyStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
    case 'per-month':
      habit.statistics = await habitRepository.getMonthlyStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
    case 'specific-days':
      habit.statistics = await habitRepository.getSpecificDaysStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
  }
  return respondSuccess(res, habit, 200)
}

const postHabit = async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  let habit = new Habit(null, req.body.name, req.body.description, req.body.date, req.body.frequency, req.body.frequencySpecific, req.body.tags);
  habit = await habitRepository.postHabit(getSession(req), req.user.id, habit)
  return respondSuccess(res, habit, 201)
}

const putHabit = async (req, res) => {

  // TODO do authorization in other way
  // const usersEssay = await essayRepository.userOwnsEssay(getSession(req), req.user.id, essayId)
  // if (!usersEssay) respondError(res, null, 401)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }

  let habit = new Habit(req.body.id, req.body.name, req.body.description, req.body.date, req.body.frequency, req.body.frequencySpecific, req.body.tags);
  habit = await habitRepository.putHabit(getSession(req), habit)
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

const getHabitStatistics = async (req, res) => {

  const habitId = req.params.habitId
  const habit = await habitRepository.getHabit(getSession(req), habitId)

  let statistics = null;
  switch (habit.frequency) {
    case 'daily':
      statistics = await habitRepository.getDailyStatistics(getSession(req), habitId, new Date(habit.date))
      break;
    case 'per-week':
      statistics = await habitRepository.getWeeklyStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
    case 'per-month':
      statistics = await habitRepository.getMonthlyStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
    case 'specific-days':
      statistics = await habitRepository.getSpecificDaysStatistics(getSession(req), habitId, new Date(habit.date), habit.frequencySpecific)
      break;
  }

  return respondSuccess(res, statistics, 200)
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
  getHabitStatistics,
  validateHabit
}
