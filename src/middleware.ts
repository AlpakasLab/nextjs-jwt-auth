import { NextMiddleware, NextRequest, NextResponse } from 'next/server'
import { getCookieAge, getCookieName } from './cookie'
import { isSecureContext } from './environment'
import { JWT, decodeJWT, encodeJWT } from './jwt'

type MiddlewareOptions = {
    redirectUrl?: string
    cookie?: {
        expires?: number
    }
}

type MiddlewareCallbackReturn = null | JWT | true

type MiddlewareCallback = (
    request: NextRequest,
    payload: JWT
) => MiddlewareCallbackReturn | Promise<MiddlewareCallbackReturn>

function getMiddleware(
    options?: MiddlewareOptions,
    callback?: MiddlewareCallback
): NextMiddleware {
    if (process.env.AUTH_SECRET === undefined)
        throw new Error('AUTH_SECRET is not defined')
    const authSecret = process.env.AUTH_SECRET

    const isSecure = isSecureContext()

    return async (request: NextRequest) => {
        const sessionCookieName = getCookieName('session', isSecure)
        const sessionCookie = request.cookies.get(sessionCookieName)

        if (!sessionCookie || !sessionCookie.value) {
            return NextResponse.redirect(
                options?.redirectUrl ?? new URL('/', request.url)
            )
        }

        const decodedSessionPayload = await decodeJWT({
            token: sessionCookie.value,
            salt: sessionCookieName,
            secret: authSecret
        })

        if (!decodedSessionPayload)
            return NextResponse.redirect(
                options?.redirectUrl ?? new URL('/', request.url)
            )

        if (callback) {
            const result = await callback(request, decodedSessionPayload)

            if (result === null) {
                const response = NextResponse.redirect(
                    options?.redirectUrl ?? new URL('/', request.url)
                )
                response.cookies.delete({
                    name: sessionCookieName,
                    httpOnly: true,
                    secure: isSecure,
                    sameSite: 'lax'
                })
                return response
            } else if (result === true) {
                return NextResponse.next()
            } else {
                const token = await encodeJWT({
                    salt: sessionCookieName,
                    secret: authSecret,
                    token: result
                })
                const response = NextResponse.next()
                response.cookies.set(sessionCookieName, token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: isSecure,
                    expires: getCookieAge(options?.cookie?.expires)
                })
                return response
            }
        } else {
            return NextResponse.next()
        }
    }
}

export { getMiddleware }
