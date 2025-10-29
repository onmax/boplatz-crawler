import { createStorage } from 'unstorage'
import vercelKVDriver from 'unstorage/drivers/vercel-kv'

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
  const key = `${SEEN_PREFIX}${id}`
  const value = await storage.getItem(key)
  return value !== null
}

export async function markApartmentSeen(id: string): Promise<void> {
  const key = `${SEEN_PREFIX}${id}`
  await storage.setItem(key, true, { ttl: TTL_SECONDS })
}

export async function filterNewApartments(apartmentIds: string[]): Promise<string[]> {
  const checks = await Promise.all(
    apartmentIds.map(async id => ({
      id,
      seen: await hasSeenApartment(id),
    }))
  )
  return checks.filter(c => !c.seen).map(c => c.id)
}
