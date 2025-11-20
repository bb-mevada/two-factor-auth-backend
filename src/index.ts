import app from './app'
import envConfig from './configs/env.config'

const startApplication = () => {
    try {
        const server = app.listen(envConfig.PORT)
        server.timeout = envConfig.SERVER_REQUEST_TIMEOUT
        console.info(`Server started on port`, envConfig.PORT)
    } catch (err) {
        console.error(`Application error`, err)
    }
}

startApplication()
