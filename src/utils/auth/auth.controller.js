import * as userRepository from "../../resources/user/user.repository";
import {newToken, verifyToken, createHashPassword, checkPassword} from "./auth.service";
import { getSession } from "../db";

const login = async (req, res) => {
  // TODO(login 1) add validation logic

  const email = req.body.email
  const user = await userRepository.getUserByEmail(getSession(req), email)
  console.log('LOGIN USER:', user)
  if (!user) return res.status(401).end()

  // TODO(login 2) uncomment when register is added
  // try {
  //   await checkPassword(req.body.password, user.password);
  // }
  // catch (error) {
  //   res.status(401).end()
  // }

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
  console.log(payload);
  const user = await userRepository.getUser(getSession(req), payload.id);
  req.user = user
  next()
}

const identify = async (req, res) => {
  return res.status(200).send({ data: req.user });
}

export const authController = {
  login,
  register,
  protect,
  identify
}
