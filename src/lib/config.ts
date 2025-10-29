import type { FilterConfig } from './types'

export function getFilterConfig(): FilterConfig {
  const env = process.env

  const config: FilterConfig = {
    locations: env.FILTER_LOCATIONS?.split(',').map(s => s.trim()) || [],
    minPrice: env.FILTER_MIN_PRICE ? Number(env.FILTER_MIN_PRICE) : 0,
    maxPrice: env.FILTER_MAX_PRICE ? Number(env.FILTER_MAX_PRICE) : Number.POSITIVE_INFINITY,
    minRooms: env.FILTER_MIN_ROOMS ? Number(env.FILTER_MIN_ROOMS) : 1,
  }

  return config
}
