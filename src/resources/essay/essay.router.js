import { Router } from 'express'
import { essayController } from "./essay.controller";
import {check, checkSchema} from "express-validator";

export const essayRouter = new Router()

essayRouter.route('/themes/:themeId/essays')
                  .get(essayController.getEssays)

essayRouter.post('/themes/:themeId/essays', checkSchema(essayController.validateEssay), essayController.postEssay)

essayRouter.route('/essays/:essayId')
                  .get(essayController.getEssay)
                  .delete(essayController.deleteEssay)

essayRouter.put('/essays/:essayId', checkSchema(essayController.validateEssay), essayController.putEssay)
