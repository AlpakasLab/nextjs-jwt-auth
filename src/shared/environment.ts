function isSecureContext() {
    const authUrl = process.env.AUTH_URL ?? ''
    return authUrl.startsWith('https://')
}

export { isSecureContext }
