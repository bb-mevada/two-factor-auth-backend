import { ErrorRequestHandler } from 'express'
import envConfig from '../configs/env.config'
import { ApplicationException } from '../helpers/error.helper'
import { ZodError } from 'zod'

type TGlobalError = Error | ApplicationException | ZodError

const globalErrorMiddleware: ErrorRequestHandler = (err: TGlobalError, _req, res, _next) => {
    let statusCode = 500
    let errorMessage = err.message

    if (err instanceof ApplicationException) {
        statusCode = err.statusCode
    } else if (err instanceof ZodError) {
        if (err.issues.length > 0) {
            const { path, message } = err.issues[0]
            statusCode = 422
            errorMessage = `${path.length > 0 ? path + ' -> ' : ''}${message}`
        }
    }

    const response = {
        success: false,
        message: errorMessage || 'Oops! Something is not right'
    }

    // Logging
    console.dir(
        {
            ...response,
            stack: err.stack,
            environment: envConfig.NODE_ENV
        },
        { depth: null, colors: true }
    )

    res.status(statusCode).json(response)
}

export default globalErrorMiddleware
