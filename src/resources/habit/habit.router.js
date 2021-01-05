import { Router } from 'express'
import { habitController } from "./habit.controller"
import { checkSchema } from "express-validator";

export const habitRouter = new Router()


habitRouter.route('/habits')
                  .get(habitController.getHabits)

habitRouter.post('/habits', checkSchema(habitController.validateHabit), habitController.postHabit)

habitRouter.route('/habits/:habitId')
                  .get(habitController.getHabit)
                  .delete(habitController.deleteHabit)

habitRouter.put('/habits/:habitId', checkSchema(habitController.validateHabit), habitController.putHabit)
