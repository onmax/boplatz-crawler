import { createStorage } from 'unstorage'
import vercelKVDriver from 'unstorage/drivers/vercel-kv'
import consola from 'consola'

// Validate env vars
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set')
}

const storage = createStorage({
  driver: vercelKVDriver({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }),
})

const SEEN_PREFIX = 'apartment:seen:'
const TTL_DAYS = 30
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60

export async function hasSeenApartment(id: string): Promise<boolean> {
  try {
    const key = `${SEEN_PREFIX}${id}`
    const value = await storage.getItem(key)
    return value !== null
  } catch (error) {
    consola.error('Failed to check apartment seen status:', error)
    return false
  }
}

export async function markApartmentSeen(id: string): Promise<void> {
  try {
    const key = `${SEEN_PREFIX}${id}`
    await storage.setItem(key, true, { ttl: TTL_SECONDS })
  } catch (error) {
    consola.error('Failed to mark apartment as seen:', error)
    throw error
  }
}

export async function filterNewApartments(apartmentIds: string[]): Promise<string[]> {
  try {
    // Batch fetch all keys at once instead of N individual calls
    const keys = apartmentIds.map(id => `${SEEN_PREFIX}${id}`)
    const values = await Promise.all(keys.map(key => storage.getItem(key)))
    return apartmentIds.filter((_, i) => values[i] === null)
  } catch (error) {
    consola.error('Failed to filter new apartments:', error)
    return apartmentIds
  }
}
