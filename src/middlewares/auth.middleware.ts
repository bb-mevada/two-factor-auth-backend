import { RequestHandler } from 'express'
import { IUserRepository } from '../interfaces/user.interface'
import { IAuthenticatedRequest } from '../types/auth.type'
import { verifyJWT } from '../helpers/jwt.helper'
import envConfig from '../configs/env.config'
import { TJwtPayload } from '../types/jwt.type'
import { ApplicationException } from '../helpers/error.helper'

type TAuthMiddlewareParams = {
    stage: ('password' | '2fa')[]
    repositories: {
        userRepository: IUserRepository
    }
}

const authMiddleware =
    (params: TAuthMiddlewareParams): RequestHandler =>
    async (_req, res, next) => {
        const req = _req as IAuthenticatedRequest
        const { accessToken } = req.cookies

        if (accessToken) {
            // jwt verify
            const jwtPayload = verifyJWT(accessToken, envConfig.ACCESS_TOKEN_SECRET) as TJwtPayload

            let isAuthenticated = false
            if (params.stage.includes(jwtPayload.stage)) {
                isAuthenticated = true
            }

            if (isAuthenticated) {
                const user = await params.repositories.userRepository.findOne(
                    { _id: jwtPayload.userId },
                    '+twoFactorAuth.secret +twoFactorAuth.recoveryCodes'
                )
                if (user) {
                    req.user = user
                    res.setHeader('X-Auth-Stage', jwtPayload.stage)
                    return next()
                }
            }
        }

        next(new ApplicationException(401, 'Unauthorized'))
    }

export default authMiddleware
