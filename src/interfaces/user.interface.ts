import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose'
import { IUserSchema } from '../types/user.type'
import { RequestHandler } from 'express'
import { TServiceSuccess } from '../types/service.type'
import z from 'zod'
import { loginUserValidator, registerUserValidator, verify2FAValidator } from '../validators/user.validator'

export interface IUserRequestData {
    register: {
        body: z.infer<typeof registerUserValidator>
    }
    login: {
        body: z.infer<typeof loginUserValidator>
    }
    activate2FA: {
        user: IUserSchema
    }
    verify2FA: {
        user: IUserSchema
        body: z.infer<typeof verify2FAValidator>
    }
    me: {
        user: IUserSchema
    }
}

export interface IUserController {
    register: RequestHandler
    login: RequestHandler
    activate2FA: RequestHandler
    verify2FA: RequestHandler
    me: RequestHandler
}

export interface IUserService {
    register: (payload: IUserRequestData['register']['body']) => Promise<TServiceSuccess<{ userId: string }>>
    login: (payload: IUserRequestData['login']['body']) => Promise<
        TServiceSuccess<{
            userId: string
            accessToken: string
        }>
    >
    activate2FA: (user: IUserRequestData['activate2FA']['user']) => Promise<
        TServiceSuccess<{
            qrDataUrl: string
            recoveryCodes: string[]
        }>
    >
    verify2FA: (
        user: IUserRequestData['verify2FA']['user'],
        payload: IUserRequestData['verify2FA']['body']
    ) => Promise<
        TServiceSuccess<{
            userId: string
            accessToken: string
        }>
    >
    me: (user: IUserRequestData['me']['user']) => TServiceSuccess<{
        userId: string
        name: string
        email: string
        twoFactorAuth: {
            activated: boolean
        }
        createdAt?: Date
    }>
}

export interface IUserRepository {
    findOne: (filter: FilterQuery<IUserSchema>, select?: string) => Promise<IUserSchema | null>
    create: (payload: IUserSchema) => Promise<IUserSchema>
    updateOne: (filter: FilterQuery<IUserSchema>, update: UpdateQuery<IUserSchema>) => Promise<UpdateWriteOpResult>
}
