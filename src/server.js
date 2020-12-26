import express from 'express'
import {json, urlencoded} from 'body-parser'
import morgan from 'morgan'
import { userRouter } from './resources/user/user.router'
import { themeRouter } from './resources/theme/theme.router'
import { essayRouter } from './resources/essay/essay.router'
import authRouter from "./utils/auth/auth.router"
import cors from 'cors'

const port = 3000;

export const app = express()

// So no one knows api is powered by express
app.disable('x-powered-by')

app.use(cors())
// Allows req.body
app.use(json())
// Allows query params in url
app.use(urlencoded({extended: true}))
// Logging middleware, example POST /next 200 5.868 ms - 19
app.use(morgan('dev'))



app.use('/', authRouter)
app.use('/api', userRouter);

//Use theme router
app.use('/api/themes', themeRouter);
app.use('/api', essayRouter);



export const start = () => {
  app.listen(port, () => {
    console.log(`BeDoHave api listening on http://localhost:${port}/api`)
  })
}
