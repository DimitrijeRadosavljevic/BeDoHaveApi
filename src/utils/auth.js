import config from '../config'
import jwt from 'jsonwebtoken'
import * as userRepository from '../resources/user/user.repository';

export const newToken = user => {
  return jwt.sign({id: user.id}, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token => {
  new Promise(((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (error, payload) => {
      if (error) return reject(error)
      resolve(payload)
    })
  }))
}

export const login = async (req, res) => {
  // TODO(login 1)   add validation

  const email = req.body.email
  const user = await userRepository.getUserByEmail(email)

  if (!user) return res.status(401).end()

  // TODO(login 2)   check password

  const token = newToken(user)
  return res.status(200).send({token})
}

export const register = async (req, res) => { }

export const protect = async (req, res, next) => {
  // TODO(use middleware in server.js)
  if(!req.headers.authorization) return res.status(401).end()

  let token = req.headers.authorization.split('Bearer ')[1]

  if (!token) return res.status(401).end()

  try {
    const payload = await verifyToken(token)
    const user = await userRepository.getUser(payload.id);
    req.user = user;
    next()
  }
  catch  (error) {
    return res.status(401).end()
  }
}
