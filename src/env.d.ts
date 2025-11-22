declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production'
        PORT: string
        DATABASE_URI: string
        ACCESS_TOKEN_SECRET: string
    }
}
