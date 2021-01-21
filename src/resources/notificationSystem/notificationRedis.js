import { driver, createClient } from "../../utils/db";
import { io } from "../../server";
import { postNotification } from "../notification/notification.repository";

export const subscribeOnChanel = (client, userId) => {
    const channel = userId + 'Notification';
    client.on('message', (channel, message) => {
      //console.log("Stigla poruka"+ message + "Channel:" + channel);
      io.emit(channel, message);
      postNotification(driver.session(), userId, message);
    });
    client.subscribe(channel, (error, count) => {
      if(error) {
        console.log(error)
      } 
      //console.log(`Subscribed on ${count}`);
    })
}

export const publishOnChanel = (client, userId, data) => {
    const channel = userId + 'Notification';
    client.publish(channel, data);
}

export const subscribeOnTheme = (client) => {

  const channel = 'themesubscription';
  client.on('message', (channel, message) => {

    const list = 'theme:'+ message;
    const messageParts = message.split(":");
    const client2 = createClient({ime: "ime", prezime:"prezime"})
    client2.smembers(messageParts[0], (err, subscribers) => { //ThemeId ce da bude naziv liste za temu;
      if(err) console.log(err);

      console.log(subscribers);
      const themeName = messageParts[1];
      subscribers.forEach(subscriber => {
        client2.lpush(subscriber+':subscribedThemes', JSON.stringify({ content: `Essay was written on this theme:${themeName}`, themeId:messageParts[0] }));
        io.emit(subscriber, `Essay was written on this theme:${themeName}`);
      });
    });
  });

  client.subscribe(channel, (error, count) => {
    if(error) {
      console.log(error)
    } 
    //console.log(`Subscribed on ${count}`);
  })
}

export const publishOnTheme = (client, theme) => {
  const channel = 'themesubscription';
  const data = theme.id+':'+theme.title;
  client.publish(channel, data);
}

