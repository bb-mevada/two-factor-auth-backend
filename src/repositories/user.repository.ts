import { FilterQuery, UpdateQuery } from 'mongoose'
import { IUserRepository } from '../interfaces/user.interface'
import { IUserSchema } from '../types/user.type'
import userModel from '../models/user.model'

export default class UserRepository implements IUserRepository {
    findOne = (filter: FilterQuery<IUserSchema>, select: string = '') => {
        return userModel.findOne(filter).select(select)
    }

    create = (payload: IUserSchema) => {
        return userModel.create(payload)
    }

    updateOne = (filter: FilterQuery<IUserSchema>, update: UpdateQuery<IUserSchema>) => {
        return userModel.updateOne(filter, update)
    }
}
