import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { boplatssydProvider } from '../../src/lib/providers/boplatssyd'
import { ofetch } from 'ofetch'

vi.mock('ofetch')

describe('boplatssydProvider', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { vi.restoreAllMocks() })

  it('has correct name', () => {
    expect(boplatssydProvider.name).toBe('boplatssyd')
  })

  it('formats URLs correctly as /visa/{id}', async () => {
    vi.mocked(ofetch).mockResolvedValue({ data: { getRentalObjectsAvailable: { rentalObjects: [{ rentalObjectId: 200071387516, regionName: 'Eslöv', rent: 5000, rooms: 2, area: 50, moveInDateFormated: '2025-01-01' }] } } })
    const result = await boplatssydProvider.fetchApartments()
    expect(result[0].url).toBe('https://www.boplatssyd.se/mypages/app/visa/200071387516')
  })

  it('fetchApartments returns array', async () => {
    vi.mocked(ofetch).mockResolvedValue({ data: { getRentalObjectsAvailable: { rentalObjects: [] } } })
    const result = await boplatssydProvider.fetchApartments()
    expect(Array.isArray(result)).toBe(true)
  })
})
