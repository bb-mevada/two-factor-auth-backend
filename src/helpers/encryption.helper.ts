import bcrypt from 'bcrypt'

export const hashValue = (value: string) => bcrypt.hash(value, 10)
