import { Router } from 'express'
import { authController } from "./auth.controller";
import {checkSchema} from "express-validator";

const authRouter = Router()


authRouter.post('/login', checkSchema(authController.loginValidate), authController.login)

authRouter.route('/register').post(authController.register)
authRouter.use(authController.protect)
authRouter.route('/identify').get(authController.identify)

export default authRouter;
