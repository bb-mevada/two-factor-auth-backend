import express, { Application } from 'express'
import globalErrorMiddleware from './middlewares/global-error.middleware'
import { ApplicationException } from './helpers/error.helper'
import userRouter from './routers/user.router'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

const app: Application = express()

// Middleware
app.use(helmet())
app.use(cookieParser())
app.use(express.json())

app.use('/v1/user', userRouter)

// 404 Handler
app.use((_req, _res, next) => {
    next(new ApplicationException(404, 'Route not found'))
})

// Global Error Handler
app.use(globalErrorMiddleware)

export default app
