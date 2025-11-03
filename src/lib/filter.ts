import { consola } from 'consola'
import type { Apartment, FilterConfig } from './types'

export function filterApartments(apartments: Apartment[], config: FilterConfig): Apartment[] {
  const filtered = apartments.filter(apt => {
    // Location filter
    if (config.locations.length > 0 && !config.locations.includes(apt.location)) {
      return false
    }

    // Price range
    if (apt.price < config.minPrice || apt.price > config.maxPrice) {
      return false
    }

    // Min rooms
    if (apt.rooms < config.minRooms) {
      return false
    }

    // Min sqm
    if (apt.sqm < config.minSqm) {
      return false
    }

    return true
  })

  consola.info(`Filtered ${filtered.length}/${apartments.length} apartments`)
  return filtered
}
