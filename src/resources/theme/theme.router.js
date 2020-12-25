import { Router } from "express";
import * as themeController from "./theme.controller"

export const themeRouter = new Router();

themeRouter.route('/user/:userId/themes')
    .get( themeController.getThemes )

themeRouter.route('/user/:userId/themes/:themeId')
    .get( themeController.getTheme )
    .delete( themeController.deleteTheme )
    .put( themeController.putTheme )

themeRouter.route('/user/:userId/theme')
    .post( themeController.postTheme )