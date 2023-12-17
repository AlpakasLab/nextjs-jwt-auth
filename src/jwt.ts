import { EncryptJWT, jwtDecrypt } from 'jose'
import { hkdf } from '@panva/hkdf'
import { DEFAULT_JWT_MAX_AGE } from './enviroment'

type JWT = {
    name: string
    email: string
    picture: string | null
    accessToken: string
    refreshToken: string
    experisIn: number
    role: string
}

async function encodeJWT(params: {
    maxAge?: number
    salt: string
    secret: string
    token?: JWT
}) {
    const { token = {}, secret, maxAge = DEFAULT_JWT_MAX_AGE, salt } = params
    const encryptionSecret = await getEncryptionKey(secret, salt)
    const now = () => (Date.now() / 1000) | 0

    return await new EncryptJWT(token)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setIssuedAt()
        .setExpirationTime(now() + maxAge)
        .setJti(crypto.randomUUID())
        .encrypt(encryptionSecret)
}

async function decodeJWT(params: {
    salt: string
    secret: string
    token?: string
}): Promise<JWT | null> {
    const { token, secret, salt } = params
    if (!token) return null
    const encryptionSecret = await getEncryptionKey(secret, salt)
    const { payload } = await jwtDecrypt(token, encryptionSecret, {
        clockTolerance: 15
    })
    return payload as JWT
}

async function getEncryptionKey(
    keyMaterial: Parameters<typeof hkdf>[1],
    salt: Parameters<typeof hkdf>[2]
) {
    return await hkdf(
        'sha256',
        keyMaterial,
        salt,
        `Generated Encryption Key (${salt})`,
        32
    )
}

export { encodeJWT, decodeJWT }

export type { JWT }
