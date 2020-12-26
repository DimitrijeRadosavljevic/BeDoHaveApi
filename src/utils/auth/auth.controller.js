import * as userRepository from "../../resources/user/user.repository";
import {newToken, verifyToken, checkPassword} from "./auth.service";
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
  const user = await userRepository.getUserByEmail(email);

  if(user == null) {

    console.log("Dodat je user");
    const registeredUser = await userRepository.postUser(req.body);
    res.status(201).send(registeredUser);
  }
  else {
    console.log("Nije dodat user")
    res.status(400).send("Username already used");
  }
}

const protect = async (req, res, next) => {
  const bearer = req.headers.authorization
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
