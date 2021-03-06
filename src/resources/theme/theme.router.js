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
    .patch( themeController.updateThemeScheduleAnswer )
themeRouter.route('/themes/:themeId/specific')
    .get( themeController.getThemeForSpecificUpdate )
themeRouter.route('/themes/overdueThemes/354')
    .get( themeController.getOverdueThemes )
themeRouter.route('/themes/:themeId/public')
    .get( themeController.getThemePublic )
    .put( themeController.publishTheme )
themeRouter.route('/themes/public/getPublicThemes')
    .get( /*themeController.getPublicThemesRedis,*/ themeController.getPublicThemes )
themeRouter.route('/themes/public/randomTheme')
    .get( themeController.getRandomTheme )
themeRouter.route('/subscribe-on-theme')
    .post( themeController.subscribeOnTheme )
themeRouter.route('/unsubscribe-from-theme')
    .post( themeController.unsubscribeFromTheme )
themeRouter.route('/themes/public/randomTheme/number')
    .get( themeController.getNumberOfRandomThemes )
themeRouter.route('/notifications-redis')
    .get( themeController.getNotificationsFromRedis )
    .delete( themeController.deleteNotificationsRedis )
themeRouter.route('/themes-personalized')
    .get(themeController.getPersonalizedThemes)
