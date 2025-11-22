import envConfig from '../configs/env.config'
import { generateMinutesSeconds } from '../helpers/date-time.helper'
import { compareValue, hashValue } from '../helpers/encryption.helper'
import { ApplicationException } from '../helpers/error.helper'
import { singJWT } from '../helpers/jwt.helper'
import { serviceSuccess } from '../helpers/service.helper'
import { IUserRepository, IUserRequestData, IUserService } from '../interfaces/user.interface'
import { TJwtPayload } from '../types/jwt.type'
import { TServiceSuccess } from '../types/service.type'

export default class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {
        //
    }

    register = async (payload: IUserRequestData['register']['body']) => {
        // Find the already register
        const user = await this.userRepository.findOne({
            email: payload.email
        })
        if (user) {
            throw new ApplicationException(400, 'User already exist')
        }

        // Hash password
        const hashedPassword = await hashValue(payload.password)

        // register user
        const newUser = await this.userRepository.create({
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            twoFactorAuth: {
                activated: false,
                secret: null,
                recoveryCodes: []
            }
        })

        return serviceSuccess('User registered', {
            userId: String(newUser._id)
        })
    }

    login = async (payload: IUserRequestData['login']['body']) => {
        // Find the already register
        const user = await this.userRepository.findOne(
            {
                email: payload.email
            },
            '+password'
        )

        if (!user) {
            throw new ApplicationException(400, 'Invalid credentials')
        }

        // Compare password
        const enteredPassword = payload.password
        const hashedPassword = user.password

        const isValidPassword = await compareValue(enteredPassword, hashedPassword)
        if (!isValidPassword) {
            throw new ApplicationException(400, 'Invalid credentials')
        }

        // Token generation
        const tokenPayload: TJwtPayload = {
            userId: String(user._id),
            stage: 'password'
        }

        const accessToken = singJWT(tokenPayload, envConfig.ACCESS_TOKEN_SECRET, generateMinutesSeconds(5))

        return serviceSuccess('Logged in', {
            userId: String(user._id),
            accessToken
        })
    }
}
