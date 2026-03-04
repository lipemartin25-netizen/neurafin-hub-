const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID ?? ''
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET ?? ''
const PLUGGY_API = 'https://api.pluggy.ai'
let cachedToken: { token: string; expiresAt: number } | null = null
export async function getPluggyToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.token
    }
    const res = await fetch(`${PLUGGY_API}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clientId: PLUGGY_CLIENT_ID,
            clientSecret: PLUGGY_CLIENT_SECRET,
        }),
    })
    if (!res.ok) throw new Error('Failed to authenticate with Pluggy')
    const data = await res.json()
    cachedToken = {
        token: data.apiKey,
        expiresAt: Date.now() + 3600000, // 1h
    }
    return cachedToken.token
}
export async function createConnectToken(userId: string): Promise<string> {
    const token = await getPluggyToken()
    const res = await fetch(`${PLUGGY_API}/connect_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': token,
        },
        body: JSON.stringify({
            clientUserId: userId,
        }),
    })
    if (!res.ok) throw new Error('Failed to create connect token')
    const data = await res.json()
    return data.accessToken
}
export async function fetchAccounts(itemId: string) {
    const token = await getPluggyToken()
    const res = await fetch(`${PLUGGY_API}/accounts?itemId=${itemId}`, {
        headers: { 'X-API-KEY': token },
    })
    if (!res.ok) throw new Error('Failed to fetch accounts')
    return res.json()
}
export async function fetchTransactions(accountId: string, from: string, to: string) {
    const token = await getPluggyToken()
    const res = await fetch(
        `${PLUGGY_API}/transactions?accountId=${accountId}&from=${from}&to=${to}&pageSize=500`,
        { headers: { 'X-API-KEY': token } }
    )
    if (!res.ok) throw new Error('Failed to fetch transactions')
    return res.json()
}
export async function fetchItem(itemId: string) {
    const token = await getPluggyToken()
    const res = await fetch(`${PLUGGY_API}/items/${itemId}`, {
        headers: { 'X-API-KEY': token },
    })
    if (!res.ok) throw new Error('Failed to fetch item')
    return res.json()
}
