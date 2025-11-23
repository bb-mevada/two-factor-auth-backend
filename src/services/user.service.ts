import envConfig from '../configs/env.config'
import { generateRecoveryCodes, generateTOTP } from '../helpers/2fa.helper'
import { generateDaysSeconds, generateMinutesSeconds } from '../helpers/date-time.helper'
import { compareValue, hashValue } from '../helpers/encryption.helper'
import { ApplicationException } from '../helpers/error.helper'
import { singJWT } from '../helpers/jwt.helper'
import { createQRCodeDataURL } from '../helpers/qr.helper'
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

    activate2FA = async (user: IUserRequestData['activate2FA']['user']) => {
        const is2FAActivated = user.twoFactorAuth.activated
        if (is2FAActivated) {
            throw new ApplicationException(400, 'Already activated')
        }

        // TOTP generation
        const totp = generateTOTP(user.email)
        const otpAuth = totp.toString()
        const qrDataUrl = await createQRCodeDataURL(otpAuth)

        // Properties
        const secret = totp.secret.base32

        // Update user
        const updatedUser = await this.userRepository.updateOne(
            {
                _id: user._id
            },
            {
                $set: {
                    'twoFactorAuth.secret': secret
                }
            }
        )

        if (updatedUser.modifiedCount === 0) {
            throw new ApplicationException(400, 'Activation failed')
        }

        return serviceSuccess('Activation loaded', {
            qrDataUrl
        })
    }

    recover2FA = async (user: IUserRequestData['recover2FA']['user'], payload: IUserRequestData['recover2FA']['body']) => {
        const is2FAActivated = user.twoFactorAuth.activated
        if (!is2FAActivated) {
            throw new ApplicationException(400, 'Recovery failed')
        }

        const nonUsedRecoveryCodes = user.twoFactorAuth.recoveryCodes.filter((rc) => !rc.used)

        let validRCCode = null
        for (const rc of nonUsedRecoveryCodes) {
            const isValidRC = await compareValue(payload.recoveryCode, rc.code)

            if (isValidRC) {
                validRCCode = rc.code
                break
            }
        }

        if (!validRCCode) {
            throw new ApplicationException(400, 'Recovery failed')
        }

        // Mark recovery code as used
        const updatedRecoveryCodes = user.twoFactorAuth.recoveryCodes.map((rc) => {
            if (rc.code === validRCCode) {
                return {
                    code: rc.code,
                    used: true
                }
            }

            return rc
        })

        const updatedUser = await this.userRepository.updateOne(
            {
                _id: user._id
            },
            {
                $set: {
                    'twoFactorAuth.recoveryCodes': updatedRecoveryCodes
                }
            }
        )

        if (updatedUser.modifiedCount === 0) {
            throw new ApplicationException(400, 'Recovery failed')
        }

        // Token generation
        const tokenPayload: TJwtPayload = {
            userId: String(user._id),
            stage: '2fa'
        }

        const accessToken = singJWT(tokenPayload, envConfig.ACCESS_TOKEN_SECRET, generateDaysSeconds(1))

        return serviceSuccess('Logged in using recovery code', {
            userId: String(user._id),
            accessToken
        })
    }

    verify2FA = async (user: IUserRequestData['verify2FA']['user'], payload: IUserRequestData['verify2FA']['body']) => {
        const totp = generateTOTP(user.email, user.twoFactorAuth.secret!)
        const delta = totp.validate({
            token: payload.totp,
            window: 1
        })

        if (delta !== 0) {
            throw new ApplicationException(400, 'Verification failed')
        }

        let recoveryCodes: Record<'plainText' | 'hashed', string[]> = {
            hashed: [],
            plainText: []
        }

        const is2FAActivated = user.twoFactorAuth.activated
        if (!is2FAActivated) {
            recoveryCodes = await generateRecoveryCodes(10)

            const updatedUser = await this.userRepository.updateOne(
                {
                    _id: user._id
                },
                {
                    $set: {
                        'twoFactorAuth.activated': true,
                        'twoFactorAuth.recoveryCodes': recoveryCodes.hashed.map((code) => {
                            return {
                                code,
                                used: false
                            }
                        })
                    }
                }
            )

            if (updatedUser.modifiedCount === 0) {
                throw new ApplicationException(400, 'Verification failed')
            }
        }

        // Token generation
        const tokenPayload: TJwtPayload = {
            userId: String(user._id),
            stage: '2fa'
        }

        const accessToken = singJWT(tokenPayload, envConfig.ACCESS_TOKEN_SECRET, generateDaysSeconds(1))

        return serviceSuccess('Logged in', {
            userId: String(user._id),
            accessToken,
            recoveryCodes: recoveryCodes.plainText
        })
    }

    me = (user: IUserRequestData['me']['user']) => {
        const sanitizedUser = {
            userId: String(user._id),
            name: user.name,
            email: user.email,
            twoFactorAuth: { activated: user.twoFactorAuth.activated },
            createdAt: user.createdAt
        }

        return serviceSuccess('User fetched', sanitizedUser)
    }

    logout = (user: IUserRequestData['logout']['user']) => {
        return serviceSuccess('Logout success', {
            userId: String(user._id)
        })
    }

    reset2FA = async (user: IUserRequestData['reset2FA']['user']) => {
        const is2FAActivated = user.twoFactorAuth.activated
        if (!is2FAActivated) {
            throw new ApplicationException(400, 'Cannot reset 2FA')
        }

        const updatedUser = await this.userRepository.updateOne(
            {
                _id: user._id
            },
            {
                $set: {
                    'twoFactorAuth.activated': false,
                    'twoFactorAuth.secret': null,
                    'twoFactorAuth.recoveryCodes': []
                }
            }
        )

        if (updatedUser.modifiedCount === 0) {
            throw new ApplicationException(400, 'Cannot reset 2FA')
        }

        // Token generation
        const tokenPayload: TJwtPayload = {
            userId: String(user._id),
            stage: 'password'
        }

        const accessToken = singJWT(tokenPayload, envConfig.ACCESS_TOKEN_SECRET, generateMinutesSeconds(5))

        return serviceSuccess('2FA reset success', {
            userId: String(user._id),
            accessToken
        })
    }
}
