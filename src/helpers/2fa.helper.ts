import OTPAuth from 'otpauth'
import { customAlphabet } from 'nanoid'
import { hashValue } from './encryption.helper'

export const generateTOTP = (email: string) => {
    const totp = new OTPAuth.TOTP({
        issuer: 'Two-FA',
        label: email,
        algorithm: 'SHA256',
        digits: 6,
        period: 30
    })

    return totp
}

export const generateRecoveryCodes = async (count: number) => {
    const ALPHA_NUMERIC_SEQ = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    const recoveryCodes: Record<'plainText' | 'hashed', string[]> = {
        plainText: [],
        hashed: []
    }

    for (let i = 1; i <= count; i++) {
        const recoveryCode = customAlphabet(ALPHA_NUMERIC_SEQ, 10)()
        recoveryCodes.plainText.push(recoveryCode)

        const hashedRecoveryCode = await hashValue(recoveryCode)
        recoveryCodes.hashed.push(hashedRecoveryCode)
    }

    return recoveryCodes
}
