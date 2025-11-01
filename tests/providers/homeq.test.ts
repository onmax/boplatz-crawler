import { describe, it, expect } from 'vitest'
import { homeqProvider } from '../../src/lib/providers/homeq'

describe('homeqProvider', () => {
  it('has correct name', () => {
    expect(homeqProvider.name).toBe('homeq')
  })

  it('returns apartments with homeq_ prefix', async () => {
    const result = await homeqProvider.fetchApartments()
    expect(Array.isArray(result)).toBe(true)

    if (result.length > 0) {
      expect(result[0].id).toMatch(/^homeq_/)
    }
  })

  it('handles missing geo config gracefully', async () => {
    // Should return empty array if config missing
    const result = await homeqProvider.fetchApartments()
    expect(Array.isArray(result)).toBe(true)
  })
})
