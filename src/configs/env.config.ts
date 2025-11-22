export default {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SERVER_REQUEST_TIMEOUT: 30 * 1000,
    DATABASE_URI: process.env.DATABASE_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET
} as const
