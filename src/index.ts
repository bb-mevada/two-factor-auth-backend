import app from './app'
import { connectDb } from './configs/db.config'
import envConfig from './configs/env.config'

const startApplication = async () => {
    try {
        // Database connection
        const dbName = await connectDb()
        console.info(`Database connected`, dbName)

        // Server connection
        const server = app.listen(envConfig.PORT)
        server.timeout = envConfig.SERVER_REQUEST_TIMEOUT
        console.info(`Server started on port`, envConfig.PORT)
    } catch (err) {
        console.error(`Application error`, err)
    }
}

void startApplication()
