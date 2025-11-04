const DEFAULT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

const LIBRARY_SLUG = 'next-jwt-secure'

const DEFAULT_NAMES = {
    session: 'session-token'
}

function getCookieName(
    type: keyof typeof DEFAULT_NAMES,
    isSecureContext?: boolean
) {
    return `${isSecureContext ? '__Secure-' : ''}${LIBRARY_SLUG}.${
        DEFAULT_NAMES[type]
    }`
}

function getCookieAge() {
    const cookieExpires = new Date()
    cookieExpires.setTime(
        cookieExpires.getTime() + DEFAULT_COOKIE_MAX_AGE * 1000
    )
    return cookieExpires
}

export { getCookieName, getCookieAge }
