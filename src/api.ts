import { cookies } from 'next/headers'
import { getCookieAge, getCookieName } from './cookie'
import { isSecureContext } from './enviroment'
import { JWT, encodeJWT } from './jwt'

type ApiOptions<C> = {
    callbacks: {
        signIn: (credentials: C) => JWT | null | Promise<JWT | null>
    }
}

function getApiRoutes<C>(options: ApiOptions<C>) {
    if (process.env.AUTH_SECRET === undefined)
        throw new Error('AUTH_SECRET is not defined')
    const authSecret = process.env.AUTH_SECRET

    const isSecure = isSecureContext()

    return {
        POST: async (request: Request) => {
            try {
                const cookiesHandler = cookies()
                const jsonBody = await request.json()

                const user = await options.callbacks.signIn(jsonBody)

                if (user === null) throw new Error('User not found')

                const sessionCookieName = getCookieName('session', isSecure)

                const token = await encodeJWT({
                    salt: sessionCookieName,
                    secret: authSecret,
                    token: user
                })

                cookiesHandler.set(sessionCookieName, token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: isSecure,
                    expires: getCookieAge()
                })

                return Response.json({ success: true }, { status: 200 })
            } catch (e) {
                return Response.json({ success: false }, { status: 500 })
            }
        },
        DELETE: async () => {
            try {
                const cookiesHandler = cookies()
                const sessionCookieName = getCookieName(
                    'session',
                    isSecureContext()
                )
                cookiesHandler.delete(sessionCookieName)
                return Response.json({ success: true }, { status: 200 })
            } catch (e) {
                return Response.json({ success: false }, { status: 500 })
            }
        }
    }
}

export { getApiRoutes }
