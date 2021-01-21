import express from 'express'
import {json, urlencoded} from 'body-parser'
import morgan from 'morgan'
import { userRouter } from './resources/user/user.router'
import { themeRouter } from './resources/theme/theme.router'
import { essayRouter } from './resources/essay/essay.router'
import { tagRouter } from "./resources/tag/tag.router";
import { likeRouter } from "./resources/like/like.router";
import { habitRouter } from "./resources/habit/habit.router";
import { habitRecordRouter } from "./resources/habit-record/habit-record.router";
import authRouter from "./utils/auth/auth.router"
import cors from 'cors'
import { notificationRouter } from './resources/notification/notification.router'
import { subscribeOnTheme } from './resources/notificationSystem/notificationRedis'
import { createClient } from './utils/db'

const port = 3000;

export const app = express()
var server = require('http').Server(app);
export var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

export let soketId = 0;
// So no one knows api is powered by express
app.disable('x-powered-by')

app.use(cors())
// Allows req.body
app.use(json())
// Allows query params in url
app.use(urlencoded({extended: true}))
// Logging middleware, example POST /next 200 5.868 ms - 19
app.use(morgan('dev'))

// io.on('connection', function( socket ) {
//   console.log("Conected");
//   socket.emit('test', "Slovca");
//   socket.on('povezano', (data) => {
//     console.log(data);
//   })

//   soketId = socket.id;
//   console.log(soketId);
// })


app.use('/', authRouter)
app.use('/api', userRouter);

//Use theme router
app.use('/api', themeRouter);
app.use('/api', essayRouter);
app.use('/api', tagRouter);
app.use('/api', likeRouter);
app.use('/api', habitRouter);
app.use('/api', habitRecordRouter);
app.use('/api', notificationRouter);

const justObject = { ime: "ime", prezime: "prezime" };
subscribeOnTheme(createClient(justObject));

export const start = () => {
  return server.listen(port, () => {
    console.log(`BeDoHave api listening on http://localhost:${port}/api`)
  })
}
