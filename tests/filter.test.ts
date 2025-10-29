import { describe, it, expect } from 'vitest'
import { filterApartments } from '../src/lib/filter'
import type { Apartment, FilterConfig } from '../src/lib/types'

describe('filter', () => {
  const apartments: Apartment[] = [
    { id: '1', location: 'Lund', price: 12000, rooms: 2, sqm: 55, url: 'https://test.com/1', postedAt: new Date() },
    { id: '2', location: 'Malmö', price: 15000, rooms: 3, sqm: 70, url: 'https://test.com/2', postedAt: new Date() },
    { id: '3', location: 'Dalby', price: 10000, rooms: 1, sqm: 35, url: 'https://test.com/3', postedAt: new Date() },
    { id: '4', location: 'Eslöv', price: 16000, rooms: 2, sqm: 60, url: 'https://test.com/4', postedAt: new Date() },
  ]

  const config: FilterConfig = {
    locations: ['Lund', 'Dalby', 'Eslöv'],
    minPrice: 11000,
    maxPrice: 17000,
    minRooms: 2,
  }

  it('filters by location', () => {
    const result = filterApartments(apartments, config)
    const locations = result.map(a => a.location)
    expect(locations).not.toContain('Malmö')
  })

  it('filters by price range', () => {
    const result = filterApartments(apartments, config)
    expect(result.every(a => a.price >= 11000 && a.price <= 17000)).toBe(true)
  })

  it('filters by min rooms', () => {
    const result = filterApartments(apartments, config)
    expect(result.every(a => a.rooms >= 2)).toBe(true)
  })

  it('applies all filters', () => {
    const result = filterApartments(apartments, config)
    expect(result).toHaveLength(2) // id 1 and 4
    expect(result.map(a => a.id)).toEqual(['1', '4'])
  })
})
