import { getCookieName } from './cookie'
import { isSecureContext } from './enviroment'
import { cookies } from 'next/headers'
import { decodeJWT } from './jwt'

async function getSession() {
    if (process.env.AUTH_SECRET === undefined)
        throw new Error('AUTH_SECRET is not defined')

    const cookiesHandler = cookies()
    const sessionCookieName = getCookieName('session', isSecureContext())

    const sessionCookie = cookiesHandler.get(sessionCookieName)
    if (!sessionCookie || !sessionCookie.value) return null

    const decodedSessionPayload = await decodeJWT({
        token: sessionCookie.value,
        salt: sessionCookieName,
        secret: process.env.AUTH_SECRET
    })

    if (!decodedSessionPayload) return null

    return decodedSessionPayload
}

export { getSession }
