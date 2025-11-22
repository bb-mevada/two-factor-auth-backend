import { hashValue } from '../helpers/encryption.helper'
import { ApplicationException } from '../helpers/error.helper'
import { serviceSuccess } from '../helpers/service.helper'
import { IUserRepository, IUserRequestData, IUserService } from '../interfaces/user.interface'
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
}
