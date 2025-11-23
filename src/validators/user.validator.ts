import { z } from 'zod'

export const registerUserValidator = z.object({
    name: z.string().nonempty(),
    email: z.email().nonempty(),
    password: z.string().min(8).max(24)
})

export const loginUserValidator = z.object({
    email: z.email().nonempty(),
    password: z.string()
})

export const verify2FAValidator = z.object({
    totp: z.string().length(6)
})

export const recover2FAValidator = z.object({
    recoveryCode: z.string().length(10)
})
