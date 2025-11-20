import mongoose from 'mongoose'
import envConfig from './env.config'

export const connectDb = () => {
    return new Promise<string>((resolve, reject) => {
        mongoose
            .connect(envConfig.DATABASE_URI)
            .then(() => resolve(mongoose.connection.name))
            .catch((err) => reject(err))
    })
}
