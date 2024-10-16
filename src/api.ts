import { cookies } from 'next/headers'
import { getCookieAge, getCookieName } from './cookie'
import { isSecureContext } from './enviroment'
import { JWT, encodeJWT } from './jwt'

type ApiOptions<C> = {
    callbacks: {
        signIn: (credentials: C) => JWT | null | Promise<JWT | null>
    }
    cookie?: {
        experis?: number
    }
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

                const user = await options.callbacks.signIn(jsonBody)

                if (user === null) throw new Error('User not found')

                const token = await encodeJWT({
                    salt: sessionCookieName,
                    secret: authSecret,
                    token: user
                })

                cookies().set(sessionCookieName, token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: isSecure,
                    expires: getCookieAge(options.cookie?.experis)
                })

                return Response.json({ success: true }, { status: 200 })
            } catch (e) {
                return Response.json({ success: false }, { status: 500 })
            }
        },
        DELETE: async () => {
            try {
                cookies().set({
                    name: sessionCookieName,
                    value: '',
                    httpOnly: true,
                    expires: 0,
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
