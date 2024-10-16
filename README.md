## ⭐️ About

NextJs JWT Auth is a library designed for the Next.js 14 ecosystem, aiming to simplify and make JWT authentication more accessible. It is particularly focused on clients who already have a backend with authenticated credentials. Based on the [next-auth](https://github.com/nextauthjs/next-auth) library.

## 🚀 Getting Started

Install using an package manager

```bash
pnpm add @alpakaslab/nextjs-jwt-auth
# or
yarn add @alpakaslab/nextjs-jwt-auth
# or
npm install @alpakaslab/nextjs-jwt-auth
```

## 🧩 Initialization

First, create an API route with the path `/api/auth/route.ts` and generate API routes using the `getApiRoutes()` helper.

```ts
// api/auth/route.ts
import { getApiRoutes } from '@alpakaslab/nextjs-jwt-auth'

const { DELETE, POST } = getApiRoutes<{ email: string; password: string }>({
    callbacks: {
        async signIn(credentials) {
            // Your login logic
            const user = getUser(credentials)

            // If the login is correct, return an object in JWT format
            return {...}

            // If the credentials are wrong return null
            return null
        }
    }
})

export { DELETE, POST }
```

Second, create an middleware file `/middleware.ts` and generate the handler using the `getMiddleware()` helper.

```ts
// middleware.ts
import { getMiddleware } from '@alpakaslab/nextjs-jwt-auth'

export const middleware = getMiddleware(undefined, async (request, payload) => {
    // Refresh token logic
   if(payload.experisIn > new Date()){
        const newData = await refreshToken(payload.refreshToken)

        // If the new data is correct, return an object in JWT format to update the cookie
        if(newData){
            return {...}
        }

        // If the refresh method returns an error, return null to force user signout
        return null
   }

    // If you don't need to update the token and the user is okay, return true
    return true
})

// Configure only the routes that require authentication
export const config = {
    matcher: '/admin/:path*'
}
```

And create two enviroment variables

```env
AUTH_URL="application base url"
AUTH_SECRET="generated token to encrypt the jwt"
```

## 🪄 Using the library

`getSession()` - This server side function returns the user session or null when user is not authenticated

```tsx
import { getSession } from '@alpakaslab/nextjs-jwt-auth'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await getSession()

    if (!session) redirect('/')

    return <div>{session.name}</div>
}
```

`signIn()` - This client side helper function receives the user credentials as a parameter and call the sign in api route, and return true or false if user is authenticated

```ts
import { signIn } from '@alpakaslab/nextjs-jwt-auth'

const onSubmit = async data => {
    const authenticated = await signIn({
        email: data.email,
        password: data.password
    })

    if (authenticated) {
        // signIn success logic
        router.replace('/admin/')
    } else {
        // signIn failed logic
    }
}
```

`signOut()` - This client side helper function call the sign out api route and return true or false if user is correctly signout

```tsx
import { signOut } from '@alpakaslab/nextjs-jwt-auth'

const onClick = async () => {
    const success = await signOut()

    if (success) {
        // signOut success logic
        router.replace('/')
        router.refresh()
    } else {
        // signOut failed logic
    }
}
```

## 💎 Typescript

All functions and methods are type-safe, and if you need to modify the JWT object, just overwrite it with a `.d.ts` file.

```ts
// nextjs-jwt-auth.d.ts
import { JWT, DefaultJWT } from '@alpakaslab/nextjs-jwt-auth'

declare module '@alpakaslab/nextjs-jwt-auth' {
    interface JWT extends DefaultJWT {
        accessToken: string
        refreshToken: string
        experisIn: number
        role: string
    }
}
```
