import { CookieOptions } from 'express'
import { generateDaysMilliSeconds, generateMinutesMilliSeconds } from './date-time.helper'
import envConfig from '../configs/env.config'

type TCookieParam =
    | {
          purpose: 'auth'
          type: 'minute' | 'day'
          value: number
      }
    | { purpose: 'logout' }

export const getCookieOptions = (param: TCookieParam) => {
    const cookieOptions: CookieOptions = {
        path: '/v1',
        httpOnly: true
    }

    if (param.purpose === 'auth') {
        let maxAge = 0

        switch (param.type) {
            case 'minute': {
                maxAge = generateMinutesMilliSeconds(param.value)
                break
            }
            case 'day': {
                maxAge = generateDaysMilliSeconds(param.value)
                break
            }
        }

        cookieOptions.maxAge = maxAge
    }

    if (envConfig.NODE_ENV === 'production') {
        cookieOptions.sameSite = 'strict'
        cookieOptions.secure = true
    }

    return cookieOptions
}
