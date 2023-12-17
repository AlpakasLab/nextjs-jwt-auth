const DEFAULT_JWT_MAX_AGE = 30 * 24 * 60 * 60
const DEFAULT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

function isSecureContext() {
    const authUrl = process.env.AUTH_URL ?? ''
    return authUrl.startsWith('https://')
}

export { isSecureContext, DEFAULT_JWT_MAX_AGE, DEFAULT_COOKIE_MAX_AGE }
