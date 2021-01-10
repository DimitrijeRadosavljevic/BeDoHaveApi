import { Router } from 'express'
import { habitRecordController } from "./habit-record.controller"
import { checkSchema } from "express-validator";

export const habitRecordRouter = new Router()


habitRecordRouter.route('/habits/:habitId/habit-records')
                                .get(habitRecordController.getHabitRecords)

habitRecordRouter.post('/habits/:habitId/habit-records', checkSchema(habitRecordController.validateRecord), habitRecordController.postHabitRecord)

habitRecordRouter.route('/habit-records/:habitRecordId')
                                .delete(habitRecordController.deleteHabitRecord)

habitRecordRouter.put('/habit-records/:habitRecordId', checkSchema(habitRecordController.validateRecord), habitRecordController.putHabitRecord)
