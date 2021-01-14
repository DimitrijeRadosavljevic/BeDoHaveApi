import { Router } from "express";
import * as notificationController from "./notification.controller"
export const notificationRouter = new Router();

notificationRouter.route('/notifications')
    .get( notificationController.getNotifications )
    .delete( notificationController.deleteAllNotifications )
notificationRouter.route('/notifications/:notificationId')
    .delete( notificationController.deleteNotification )
notificationRouter.route('/notifications/update')
    .put(notificationController.putNotifications )