import { Router } from 'express'
import * as tagController from './tag.controller'

export const tagRouter = new Router();

tagRouter.route('/tags')
                      .get(tagController.getTags )
tagRouter.route('/tags/:themeId')
                        .get(tagController.getThemeTags )
