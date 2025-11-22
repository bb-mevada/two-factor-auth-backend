import { RequestHandler } from 'express'
import { IUserController, IUserRequestData, IUserService } from '../interfaces/user.interface'
import { registerUserValidator } from '../validators/user.validator'

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
}
