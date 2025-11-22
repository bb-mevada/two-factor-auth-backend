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
