import { consola } from 'consola'
import { apartmentSchema } from './schemas'
import type { Apartment } from './types'

export function parseApartments(raw: any[]): Apartment[] {
  const apartments: Apartment[] = []

  for (const item of raw) {
    try {
      const parsed = apartmentSchema.parse(item)
      apartments.push(parsed as Apartment)
    } catch (error) {
      consola.warn('Skipping invalid apartment', { item, error })
    }
  }

  consola.info(`Parsed ${apartments.length}/${raw.length} apartments`)
  return apartments
}
