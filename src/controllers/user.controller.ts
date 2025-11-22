import { RequestHandler } from 'express'
import { IUserController, IUserRequestData, IUserService } from '../interfaces/user.interface'
import { loginUserValidator, registerUserValidator } from '../validators/user.validator'
import { getCookieOptions } from '../helpers/cookie.helper'

export default class UserController implements IUserController {
    constructor(private userService: IUserService) {
        //
    }

    register: RequestHandler = async (req, res, next) => {
        const body = req.body as IUserRequestData['register']['body']

        // Validate
        const { success, data, error } = registerUserValidator.safeParse(body)
        if (!success) {
            next(error)
            return
        }

        const response = await this.userService.register(data)
        res.status(201).json(response)
    }

    login: RequestHandler = async (req, res, next) => {
        const body = req.body as IUserRequestData['login']['body']

        // Validate
        const { success, data, error } = loginUserValidator.safeParse(body)
        if (!success) {
            next(error)
            return
        }

        const response = await this.userService.login(data)

        // Set Cookie
        const cookieOptions = getCookieOptions({ purpose: 'auth', type: 'minute', value: 5 })
        res.cookie('accessToken', response.data.accessToken, cookieOptions)
        res.status(200).json(response)
    }
}
