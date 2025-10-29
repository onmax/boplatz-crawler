import { defu } from 'defu'
import type { FilterConfig } from './types'

export function getFilterConfig(): FilterConfig {
  const env = process.env

  const defaults: FilterConfig = {
    locations: [],
    minPrice: 0,
    maxPrice: Number.POSITIVE_INFINITY,
    minRooms: 1,
  }

  const config = {
    locations: env.FILTER_LOCATIONS?.split(',').map(s => s.trim()) || [],
    minPrice: Number(env.FILTER_MIN_PRICE) || 0,
    maxPrice: Number(env.FILTER_MAX_PRICE) || Number.POSITIVE_INFINITY,
    minRooms: Number(env.FILTER_MIN_ROOMS) || 1,
  }

  return defu(config, defaults)
}
