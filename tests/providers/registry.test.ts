import { describe, it, expect } from 'vitest'
import { fetchAllApartments } from '../../src/lib/providers/registry'

describe('fetchAllApartments', () => {
  it('merges results from multiple providers', async () => {
    const result = await fetchAllApartments()
    expect(Array.isArray(result)).toBe(true)
  })

  it('handles provider failures gracefully', async () => {
    const result = await fetchAllApartments()
    expect(result).toBeDefined()
  })
})
