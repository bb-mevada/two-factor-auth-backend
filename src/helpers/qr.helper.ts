import qrcode from 'qrcode'

export const createQRCodeDataURL = (data: string) => qrcode.toDataURL(data)
