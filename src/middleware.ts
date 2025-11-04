import { NextMiddleware, NextRequest, NextResponse } from 'next/server'
import { getCookieAge, getCookieName } from './shared/cookie'
import { isSecureContext } from './shared/environment'
import { JWT, decryptJWT, encryptJWT } from './core/jwt'

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

        try {
            const decodedSessionPayload = await decryptJWT({
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
                    const token = await encryptJWT({
                        salt: sessionCookieName,
                        secret: authSecret,
                        token: result
                    })
                    const response = NextResponse.next()
                    response.cookies.set(sessionCookieName, token, {
                        httpOnly: true,
                        sameSite: 'lax',
                        secure: isSecure,
                        expires: getCookieAge()
                    })
                    return response
                }
            } else {
                return NextResponse.next()
            }
        } catch (e) {
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
        }
    }
}

export { getMiddleware }
