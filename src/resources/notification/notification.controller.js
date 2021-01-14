import { respondError, respondSuccess } from "../../helpers/response";
import * as notificationRepository from "./notification.repository"
import { getSession } from "../../utils/db"
export const getNotifications = async (req, res) => {

    const notifications = await notificationRepository.getNotifications(getSession(req), req.user.id, req.query.seen, req.query.perPage || 6, req.query.page || 1);
    return respondSuccess(res, notifications, 200);

}

export const putNotifications = async (req, res) => {

    const notifications = await notificationRepository.putNotifications(getSession(req), req.user.id, req.body);
    return respondSuccess(res, notifications, 200);

}

export const deleteAllNotifications = async (req, res) => {

    const notifications = await notificationRepository.deleteAllNotifications(getSession(req), req.user.id);
    if(notifications != null){
        return respondSuccess(res, null, 201);
    } else {
        return respondError(res, "Some error ocured", 500);
    }

}

export const deleteNotification = async (req, res) => {

    const notifications = await notificationRepository.deleteNotification(getSession(req), req.user.id, req.params.notificationId);
    if(notifications != null){
        return respondSuccess(res, null, 201);
    } else {
        return respondError(res, "Some error ocured", 500);
    }

}