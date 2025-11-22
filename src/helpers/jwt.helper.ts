import jwt from 'jsonwebtoken'
import { TJwtPayload } from '../types/jwt.type'

export const singJWT = (payload: TJwtPayload, secret: string, expiresIn: number) => jwt.sign(payload, secret, { expiresIn })
