## ⭐️ About

Next JWT Secure is a library designed for the Next.js 14 ecosystem, aiming to simplify and make JWT authentication more accessible. It is particularly focused on clients who already have a backend with authenticated credentials. Based on the [next-auth](https://github.com/nextauthjs/next-auth) library.

## 🚀 Getting Started

Install using an package manager

```bash
pnpm add @alpakaslab/next-jwt-secure
# or
yarn add @alpakaslab/next-jwt-secure
# or
npm install @alpakaslab/next-jwt-secure
```

## 🧩 Initialization

First, create an API route with the path `/api/auth/route.ts` and generate API routes using the `getApiRoutes()` helper.

```ts
// api/auth/route.ts
import { getApiRoutes } from '@alpakaslab/next-jwt-secure'

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

And create an middleware file `/middleware.ts` and generate the handler using the `getMiddleware()` helper.

```ts
// middleware.ts
import { getMiddleware } from '@alpakaslab/next-jwt-secure'
import moment from 'moment'

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

## 🪄 Using the library

`getSession()` - This server side function returns the user session or null when user is not authenticated

```tsx
import { getSession } from '@alpakaslab/next-jwt-secure'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await getSession()

    if (!session) redirect('/')

    return <div>{session.name}</div>
}
```

`signIn()` - This client side helper function receives the user credentials as a parameter and call the sign in api route, and return true or false if user is authenticated

```ts
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
