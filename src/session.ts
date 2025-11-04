'use server'

import { getCookieName } from './shared/cookie'
import { isSecureContext } from './shared/environment'
import { cookies } from 'next/headers'
import { decryptJWT } from './core/jwt'

async function getSession() {
    if (process.env.AUTH_SECRET === undefined)
        throw new Error('AUTH_SECRET is not defined')

    const cookiesHandler = await cookies()
    const sessionCookieName = getCookieName('session', isSecureContext())

    const sessionCookie = cookiesHandler.get(sessionCookieName)
    if (!sessionCookie || !sessionCookie.value) return null

    try {
        const decodedSessionPayload = await decryptJWT({
            token: sessionCookie.value,
            salt: sessionCookieName,
            secret: process.env.AUTH_SECRET
        })

        if (!decodedSessionPayload) return null

        return decodedSessionPayload
    } catch (e) {
        return null
    }
}

export { getSession }
