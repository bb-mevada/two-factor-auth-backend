export default {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SERVER_REQUEST_TIMEOUT: 30 * 1000,
    DATABASE_URI: process.env.DATABASE_URI
} as const
