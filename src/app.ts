import express, { Application } from 'express'
import globalErrorMiddleware from './middlewares/global-error.middleware'
import { ApplicationException } from './helpers/error.helper'

const app: Application = express()

// Middleware
app.use(express.json())

// 404 Handler
app.use((_req, _res, next) => {
    next(new ApplicationException(404, 'Route not found'))
})

// Global Error Handler
app.use(globalErrorMiddleware)

export default app
