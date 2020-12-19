import express from 'express'
import {json, urlencoded} from 'body-parser'
import morgan from 'morgan'
const port = 3000;

export const app = express()

// So no one knows api is powered by express
app.disable('x-powered-by')

// Allows req.body
app.use(json())
// Allows query params in url
app.use(urlencoded({extended: true}))
// Logging middleware, example POST /next 200 5.868 ms - 19
app.use(morgan('dev'))


export const start = () => {
  app.listen(port, () => {
    console.log(`BeDoHave api listening on http://localhost:${port}/api`)
  })
}
