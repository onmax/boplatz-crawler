import { ofetch } from 'ofetch'
import { consola } from 'consola'
import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'

const TOKEN_KEY = 'homeq:jwt_token'
const TOKEN_EXPIRY_KEY = 'homeq:jwt_expiry'
const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Auth endpoint from research
const AUTH_URL = 'https://api.homeq.se/api/v3/auth/login'

// Storage instance for token caching
let storage: ReturnType<typeof createStorage> | null = null

function getStorage() {
  if (!storage) {
    storage = createStorage({
      driver: redisDriver({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: 7 * 24 * 60 * 60, // 7 days TTL
      }),
    })
  }
  return storage
}

export async function getHomeqToken(): Promise<string> {
  const storage = getStorage()

  // Check cache
  const cached = await storage.getItem(TOKEN_KEY)
  const expiry = await storage.getItem(TOKEN_EXPIRY_KEY)

  if (cached && expiry && Date.now() < Number(expiry)) {
    consola.debug('[homeq-auth] Using cached token')
    return String(cached)
  }

  // Refresh token
  consola.info('[homeq-auth] Token expired or missing, refreshing')
  return await refreshHomeqToken()
}

export async function refreshHomeqToken(): Promise<string> {
  const email = process.env.HOMEQ_EMAIL
  const password = process.env.HOMEQ_PASSWORD

  if (!email || !password) {
    throw new Error('HOMEQ_EMAIL and HOMEQ_PASSWORD must be set')
  }

  consola.info('[homeq-auth] Refreshing token')

  try {
    const response = await ofetch(AUTH_URL, {
      method: 'POST',
      body: { email, password },
      timeout: 10000,
    })

    // Extract token - try multiple possible field names
    const token = response.token || response.jwt || response.access_token

    if (!token) {
      throw new Error('No token in auth response')
    }

    // Cache token
    const storage = getStorage()
    const expiry = Date.now() + TOKEN_LIFETIME_MS

    await storage.setItem(TOKEN_KEY, token)
    await storage.setItem(TOKEN_EXPIRY_KEY, expiry)

    consola.success('[homeq-auth] Token refreshed and cached')
    return String(token)
  } catch (error) {
    consola.error('[homeq-auth] Token refresh failed', error)
    throw error
  }
}
