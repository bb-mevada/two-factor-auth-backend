export type TJwtPayload = {
    userId: string
    stage: 'password' | '2fa'
}
