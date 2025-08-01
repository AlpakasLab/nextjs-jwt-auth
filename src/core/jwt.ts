import { EncryptJWT, jwtDecrypt } from 'jose'

const DEFAULT_JWT_MAX_AGE = 30 * 24 * 60 * 60

export interface DefaultJWT extends Record<string, unknown> {
    name: string
    email: string
    picture?: string | null
}

export interface JWT extends Record<string, unknown>, DefaultJWT {}

const enc = 'A256CBC-HS512'

async function getEncryptionKey(
    ikm: Uint8Array,
    salt: Uint8Array,
    keyLen = 64
): Promise<Uint8Array> {
    const importedKey = await crypto.subtle.importKey(
        'raw',
        ikm,
        { name: 'HKDF' },
        false,
        ['deriveBits']
    )
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt,
            info: new Uint8Array([])
        },
        importedKey,
        keyLen * 8
    )
    return new Uint8Array(derivedBits)
}

async function encryptJWT(params: {
    maxAge?: number
    salt: string
    secret: string
    token?: JWT
}) {
    const { token = {}, secret, maxAge = DEFAULT_JWT_MAX_AGE, salt } = params
    const encodedKey = new TextEncoder().encode(secret)
    const encodedSalt = new TextEncoder().encode(salt)
    const encryptionSecret = await getEncryptionKey(encodedKey, encodedSalt)
    const now = () => (Date.now() / 1000) | 0

    return await new EncryptJWT(token)
        .setProtectedHeader({ alg: 'dir', enc })
        .setIssuedAt()
        .setExpirationTime(now() + maxAge)
        .setJti(crypto.randomUUID())
        .encrypt(encryptionSecret)
}

async function decryptJWT(params: {
    salt: string
    secret: string
    token?: string
}): Promise<JWT | null> {
    const { token, secret, salt } = params
    if (!token) return null
    const encodedKey = new TextEncoder().encode(secret)
    const encodedSalt = new TextEncoder().encode(salt)
    const encryptionSecret = await getEncryptionKey(encodedKey, encodedSalt)
    const { payload } = await jwtDecrypt(token, encryptionSecret, {
        clockTolerance: 15,
        keyManagementAlgorithms: ['dir'],
        contentEncryptionAlgorithms: [enc]
    })
    return payload as JWT
}

export { encryptJWT, decryptJWT }
