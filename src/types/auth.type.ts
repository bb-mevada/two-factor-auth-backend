import { Request } from 'express'
import { IUserSchema } from './user.type'

export interface IAuthenticatedRequest extends Request {
    cookies: {
        accessToken: string
    }
    user: IUserSchema
}
