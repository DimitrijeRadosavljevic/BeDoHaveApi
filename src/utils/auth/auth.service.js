import config from '../../config'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const newToken = user => {
  return jwt.sign({id: user.id}, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = async token => {
  const result = await jwt.verify(token, config.secrets.jwt)
  return result
}

export const checkPassword = async (password, passwordHash) => {
  const result = await bcrypt.compare(password, passwordHash)
  return result
}

export const createHashPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 8)
  return hashPassword;
}

