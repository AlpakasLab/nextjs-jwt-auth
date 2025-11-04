import { cookies } from 'next/headers'

import { getCookieAge, getCookieName } from './shared/cookie'
import { isSecureContext } from './shared/environment'
import { JWT, encryptJWT } from './core/jwt'

type ApiOptions<C> = {
    signIn: (credentials: C) => Promise<JWT | null>
}

function getApiRoutes<C>(options: ApiOptions<C>) {
    if (process.env.AUTH_SECRET === undefined)
        throw new Error('AUTH_SECRET is not defined')
    const authSecret = process.env.AUTH_SECRET
    const isSecure = isSecureContext()
    const sessionCookieName = getCookieName('session', isSecure)

    return {
        POST: async (request: Request) => {
            try {
                const jsonBody = await request.json()

                const user = await options.signIn(jsonBody)

                if (user === null) throw new Error('User not found')

                const token = await encryptJWT({
                    salt: sessionCookieName,
                    secret: authSecret,
                    token: user
                })

                const cookieStore = await cookies()

                cookieStore.set(sessionCookieName, token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: isSecure,
                    expires: getCookieAge()
                })

                return Response.json(
                    { success: true, user: user },
                    { status: 200 }
                )
            } catch (e) {
                return Response.json({ success: false }, { status: 500 })
            }
        },
        DELETE: async () => {
            try {
                const cookieStore = await cookies()

                cookieStore.delete({
                    name: sessionCookieName,
                    httpOnly: true,
                    secure: isSecure,
                    sameSite: 'lax'
                })

                return Response.json({ success: true }, { status: 200 })
            } catch (e) {
                return Response.json({ success: false }, { status: 500 })
            }
        }
    }
}

export { getApiRoutes }
