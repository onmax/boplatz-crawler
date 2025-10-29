import { describe, it, expect } from 'vitest'
import { parseApartments } from '../src/lib/parser'

describe('parser', () => {
  it('parses valid apartment data', () => {
    const raw = [{
      id: 'apt-123',
      location: 'Lund',
      price: 12000,
      rooms: 2,
      sqm: 55,
      url: 'https://boplatssyd.se/apt-123',
      postedAt: '2025-10-29',
    }]

    const result = parseApartments(raw)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('apt-123')
    expect(result[0].location).toBe('Lund')
    expect(result[0].price).toBe(12000)
  })

  it('skips invalid entries', () => {
    const raw = [
      { id: 'valid', location: 'Lund', price: 12000, rooms: 2, sqm: 55, url: 'https://test.com', postedAt: '2025-10-29' },
      { id: 'invalid', price: 'bad' }, // invalid
    ]

    const result = parseApartments(raw)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('valid')
  })
})
