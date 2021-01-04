import { Router } from 'express'
import * as likeController from './like.controller'

export const likeRouter = new Router()


likeRouter.route('/likes/theme/:themeId')
                          .post(likeController.likeTheme)
                          .delete(likeController.unLikeTheme)

likeRouter.route('/likes/essay/:essayId')
                          .post(likeController.likeEssay)
                          .delete(likeController.unLikeEssay)
