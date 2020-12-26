import { Router } from 'express'
import { authController } from "./auth.controller";

const authRouter = Router()


authRouter.route('/login').post(authController.login)
authRouter.route('/register').post(authController.register)
//authRouter.use(authController.protect)
authRouter.route('/identify').get(authController.identify)

export default authRouter;
