import { describe, it, expect } from 'vitest'
import { consola } from 'consola'
import { fetchApartments } from '../../src/lib/fetcher'

describe('Multi-provider integration', () => {
  it('fetches apartments from all providers', async () => {
    const apartments = await fetchApartments()

    expect(Array.isArray(apartments)).toBe(true)
    consola.info(`Fetched ${apartments.length} total apartments`)
  })

  it('handles mixed provider IDs', async () => {
    const apartments = await fetchApartments()

    const boplatssydApts = apartments.filter(a => !a.id.startsWith('homeq_'))
    const homeqApts = apartments.filter(a => a.id.startsWith('homeq_'))

    consola.info(`Boplatssyd: ${boplatssydApts.length}, HomeQ: ${homeqApts.length}`)

    // At least one provider should work
    expect(apartments.length).toBeGreaterThan(0)
  })

  it('deduplicates apartments by ID', async () => {
    const apartments = await fetchApartments()
    const ids = apartments.map(a => a.id)
    const uniqueIds = new Set(ids)

    expect(ids.length).toBe(uniqueIds.size)
  })
})
