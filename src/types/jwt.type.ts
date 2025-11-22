export type TJwtPayload = {
    userId: string
    stage: 'password' | 'auth-code'
}
