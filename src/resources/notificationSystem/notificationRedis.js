import { driver } from "../../utils/db";
import { io } from "../../server";
import { postNotification } from "../notification/notification.repository";

export const subscribeOnChanel = (client, userId) => {
    const channel = userId + 'Notification';
    client.on('message', (channel, message) => {
      console.log("Stigla poruka"+ message + "Channel:" + channel);
      io.emit(channel, message);
      postNotification(driver.session(), userId, message);
    });
    client.subscribe(channel, (error, count) => {
      if(error) {
        console.log(error)
      } 
      console.log(`Subscribed on ${count}`);
    })
}

export const publishOnChanel = (client, userId, data) => {
    const channel = userId + 'Notification';
    client.publish(channel, data);
}