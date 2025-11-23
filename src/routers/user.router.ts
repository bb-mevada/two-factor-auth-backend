import { Router } from 'express'
import UserRepository from '../repositories/user.repository'
import UserService from '../services/user.service'
import UserController from '../controllers/user.controller'
import authMiddleware from '../middlewares/auth.middleware'

const userRouter = Router()

// Repository
const userRepository = new UserRepository()

// Service
const userService = new UserService(userRepository)

// Controller
const userController = new UserController(userService)

userRouter.route('/register').post(userController.register)
userRouter.route('/login').post(userController.login)

userRouter.route('/activate-2fa').post(
    authMiddleware({
        stage: ['password'],
        repositories: { userRepository }
    }),
    userController.activate2FA
)

userRouter.route('/recover-2fa').put(
    authMiddleware({
        stage: ['password'],
        repositories: { userRepository }
    }),
    userController.recover2FA
)

userRouter.route('/verify-2fa').post(
    authMiddleware({
        stage: ['password'],
        repositories: { userRepository }
    }),
    userController.verify2FA
)

userRouter.route('/me').get(
    authMiddleware({
        stage: ['password', '2fa'],
        repositories: { userRepository }
    }),
    userController.me
)

userRouter.route('/logout').put(
    authMiddleware({
        stage: ['password', '2fa'],
        repositories: { userRepository }
    }),
    userController.logout
)

userRouter.route('/reset-2fa').put(
    authMiddleware({
        stage: ['2fa'],
        repositories: { userRepository }
    }),
    userController.reset2FA
)

export default userRouter
