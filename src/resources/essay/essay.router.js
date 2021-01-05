import { Router } from 'express'
import { essayController } from "./essay.controller";
import { checkSchema } from "express-validator";

export const essayRouter = new Router()

essayRouter.route('/themes/:themeId/essays')
                  .get(essayController.getEssays)

essayRouter.route('/themes/:themeId/essays/public')
                  .get(essayController.getEssaysPublic)

essayRouter.post('/themes/:themeId/essays', checkSchema(essayController.validateEssay), essayController.postEssay)

essayRouter.route('/essays/:essayId')
                  .get(essayController.getEssay)
                  .delete(essayController.deleteEssay)


essayRouter.route('/essays/:essayId/detail')
                  .get(essayController.getEssayDetail)

essayRouter.put('/essays/:essayId', checkSchema(essayController.validateEssay), essayController.putEssay)
