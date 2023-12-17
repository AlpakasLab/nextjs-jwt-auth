async function signIn<C>(data: C) {
    const signInRespose = await fetch('/api/auth/', {
        method: 'POST',
        body: JSON.stringify(data)
    })

    if (!signInRespose.ok) {
        return false
    }

    const responseData = (await signInRespose.json()) as {
        success: boolean
    }

    if (responseData.success) {
        return true
    } else {
        return false
    }
}

async function signOut() {
    const signInRespose = await fetch('/api/auth/', {
        method: 'DELETE'
    })

    if (!signInRespose.ok) {
        return false
    }

    const responseData = (await signInRespose.json()) as {
        success: boolean
    }

    if (responseData.success) {
        return true
    } else {
        return false
    }
}

export { signIn, signOut }
