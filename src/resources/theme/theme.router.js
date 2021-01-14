import { Router } from "express";
import {check, checkSchema} from "express-validator";
import * as themeController from "./theme.controller"


export const themeRouter = new Router();

themeRouter.route('/themes')
    .post(checkSchema(themeController.validateTheme), themeController.postTheme )
themeRouter.route('/themes')
    .get( themeController.getThemesPaginate )

themeRouter.route('/themes/:themeId')
    .get( themeController.getTheme )
    .delete( themeController.deleteTheme )
    .put(checkSchema(themeController.validateTheme), themeController.putTheme )
themeRouter.route('/themes/overdueThemes/354')
    .get( themeController.getOverdueThemes )
themeRouter.route('/themes/:themeId/public')
  .get( themeController.getThemePublic )
  .put( themeController.publishTheme )
themeRouter.route('/themes/public/getPublicThemes')
    .get( /*themeController.getPublicThemesRedis,*/ themeController.getPublicThemes )