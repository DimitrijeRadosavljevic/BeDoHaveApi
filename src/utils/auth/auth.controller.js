import * as userRepository from "../../resources/user/user.repository";
import {newToken, verifyToken, createHashPassword, checkPassword} from "./auth.service";
import { createClient, getSession } from "../db";
import {respondError} from "../../helpers/response";
import {validationResult} from "express-validator";
import { getJSDocImplementsTags } from "typescript";
import * as notificationSystem from "../../resources/notificationSystem/notificationRedis"

const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    respondError(res, errors.array(), 400)
  }
  const email = req.body.email
  const user = await userRepository.getUserByEmail(getSession(req), email)
  if (!user) return res.status(401).end()

  const match = await checkPassword(req.body.password, user.password);

  if (!match) {
    return respondError(res, null, 401)
  }

  const token = newToken(user)
  return res.status(200).send({token, data: user})
}

const register = async (req, res) => {

  const email = req.body.email
  const user = await userRepository.getUserByEmail(getSession(req), email);

  if(user == null) {
    const hash = await createHashPassword(req.body.password);
    req.body.password = hash;
    const registeredUser = await userRepository.postUser(getSession(req), req.body);
    const token = newToken(registeredUser);

    notificationSystem.subscribeOnChanel(createClient(req), registeredUser.id);
    res.status(201).send({token, data: registeredUser});
  }
  else {
    res.status(400).send("Username already used");
  }
}

const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) return res.status(401).end()
  let token = bearer.split('Bearer ')[1]
  if (!token) return res.status(401).end()
  let payload
  try {
    payload = await verifyToken(token);
  } catch (error) {
    return res.status(401).end()
  }

  const user = await userRepository.getUser(getSession(req), payload.id);
  req.user = user;
  next()
}

const identify = async (req, res) => {
  return res.status(200).send({ data: req.user });
}

const loginValidate = {
  email: {
    in: ['body'],
    isLength: {
      errorMessage: 'Email required',
      options: { min: 1 }
    },
    isEmail: {
      errorMessage: 'Email wrong format',
    }
  },
  password: {
    in: ['body'],
    isLength: {
      errorMessage: 'Password required',
      options: { min: 1 }
    }
  },
}

export const authController = {
  login,
  register,
  protect,
  identify,

  loginValidate
}
