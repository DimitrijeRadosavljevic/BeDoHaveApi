import { Router } from "express";
import * as themeController from "./theme.controller"

export const themeRouter = new Router();

themeRouter.route('/themes')
    .post( themeController.postTheme )
themeRouter.route('/themes')
    .get( themeController.getThemesPaginate )

themeRouter.route('/themes/:themeId')
    .get( themeController.getTheme )
    .delete( themeController.deleteTheme )
    .put( themeController.putTheme )
