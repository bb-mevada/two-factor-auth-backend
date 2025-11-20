import { Types } from 'mongoose'

type TTwoFactorAuthRecoveryCode = {
    code: string
    used: boolean
}

type TTwoFactorAuth = {
    activated: boolean
    secret: string | null
    recoveryCodes: TTwoFactorAuthRecoveryCode[]
}

export interface IUserSchema {
    _id?: Types.ObjectId
    name: string
    email: string
    password: string
    twoFactorAuth: TTwoFactorAuth
    createdAt?: Date
    updatedAt?: Date
}
