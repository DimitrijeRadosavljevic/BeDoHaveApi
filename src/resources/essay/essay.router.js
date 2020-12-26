import { Router } from 'express'
import { essayController } from "./essay.controller";

export const essayRouter = new Router()

essayRouter.route('/themes/:themeId/essays')
                  .get(essayController.getEssays)
                  .post(essayController.postEssay)

essayRouter.route('/essays/:essayId')
                  .get(essayController.getEssay)
                  .put(essayController.putEssay)
                  .delete(essayController.deleteEssay)
