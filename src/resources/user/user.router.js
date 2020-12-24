import { Router } from 'express'
import * as userRepository from './user.repository'
export const userRouter = new Router(); 

userRouter.route('/postUser').post( async (req, res) => {

    const data =  await userRepository.postUser(req.body);
    res.status(200).send( { data: "User iz created" , person: data });

})

userRouter.route('/getUSer/:id').get( async (req, res) => {

    const data =  await userRepository.getUser(req.params.id);
    res.status(200).send( { person: data });

})

