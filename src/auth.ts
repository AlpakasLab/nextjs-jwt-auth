import type { JWT } from './core/jwt'

async function signIn<C>(data: C) {
    const signInResponse = await fetch('/api/auth/', {
        method: 'POST',
        body: JSON.stringify(data)
    })

    if (!signInResponse.ok) {
        return { success: false }
    }

    const responseData = (await signInResponse.json()) as {
        success: boolean
        user?: JWT
    }

    return responseData
}

async function signOut() {
    const signInResponse = await fetch('/api/auth/', {
        method: 'DELETE'
    })

    if (!signInResponse.ok) {
        return false
    }

    const responseData = (await signInResponse.json()) as {
        success: boolean
    }

    if (responseData.success) {
        return true
    } else {
        return false
    }
}

export { signIn, signOut }
