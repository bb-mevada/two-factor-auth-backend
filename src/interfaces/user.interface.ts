import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose'
import { IUserSchema } from '../types/user.type'
import { RequestHandler } from 'express'
import { TServiceSuccess } from '../types/service.type'
import z from 'zod'
import { registerUserValidator } from '../validators/user.validator'

export interface IUserRequestData {
    register: {
        body: z.infer<typeof registerUserValidator>
    }
}

export interface IUserController {
    register: RequestHandler
}

export interface IUserService {
    register: (payload: IUserRequestData['register']['body']) => Promise<TServiceSuccess<{ userId: string }>>
}

export interface IUserRepository {
    findOne: (filter: FilterQuery<IUserSchema>, select?: string) => Promise<IUserSchema | null>
    create: (payload: IUserSchema) => Promise<IUserSchema>
    updateOne: (filter: FilterQuery<IUserSchema>, update: UpdateQuery<IUserSchema>) => Promise<UpdateWriteOpResult>
}
