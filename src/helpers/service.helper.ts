import { TServiceSuccess } from '../types/service.type'

export const serviceSuccess = <T>(message: string, data: T): TServiceSuccess<T> => {
    return {
        success: true,
        message,
        data
    }
}
