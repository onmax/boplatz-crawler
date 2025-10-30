import { createStorage } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'
import consola from 'consola'

// Validate env vars
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL must be set')
}

const storage = createStorage({
  driver: redisDriver({
    url: process.env.REDIS_URL,
    ttl: 30 * 24 * 60 * 60, // 30 days default TTL
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

export async function clearAllSeenApartments(): Promise<number> {
  try {
    const keys = await storage.getKeys(SEEN_PREFIX)
    await Promise.all(keys.map(key => storage.removeItem(key)))
    consola.success(`Cleared ${keys.length} seen apartments`)
    return keys.length
  } catch (error) {
    consola.error('Failed to clear seen apartments:', error)
    throw error
  }
}
