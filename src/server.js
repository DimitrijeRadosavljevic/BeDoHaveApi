import express from 'express'
import {json, urlencoded} from 'body-parser'
import morgan from 'morgan'
import { userRouter } from './resources/user/user.router'
//import * as userRepository from "./Repositories/userRepository"
import * as userRepository from "./resources/user/user.repository" 
import { themeRouter } from './resources/theme/theme.router'
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




app.get('/api/getSlovca', (req, res) => {
  res.status(200).send({ slovca: "Slovca" });
})


app.post('/api/postSlovca', (req, res) => {
  res.status(300).send( { data: req.body})
})


// app.post('/api/postPerson', async (req, res) => {

//   const data =  await userRepository.postUser(req.body);
//   res.status(200).send( { data: "Person iz created" , person: data });
//   //return 700000;

// })

//Use user router
app.use('/api', userRouter);

//Use theme router
app.use('/api/themes', themeRouter);


export const start = () => {
  app.listen(port, () => {
    console.log(`BeDoHave api listening on http://localhost:${port}/api`)
  })
}
