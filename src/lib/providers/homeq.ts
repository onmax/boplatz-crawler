import { ofetch } from 'ofetch'
import { consola } from 'consola'
import type { Provider } from './base'
import type { Apartment } from '../types'
import { getFilterConfig, getHomeqConfig } from '../config'
import { getHomeqToken } from '../services/homeq-auth'
import { calculateGeoBounds } from '../services/geo'

const SEARCH_URL = 'https://api.homeq.se/api/v3/search'

async function fetchApartments(): Promise<Apartment[]> {
  try {
    const homeqConfig = getHomeqConfig()
    const filterConfig = getFilterConfig()

    // Validate config
    if (!homeqConfig.centerLat || !homeqConfig.centerLng) {
      consola.warn('[homeq] Missing HOMEQ_CENTER_LAT/LNG, skipping')
      return []
    }

    consola.info('[homeq] Fetching apartments')

    // Get auth token
    const token = await getHomeqToken()

    // Calculate geo bounds
    const geoBounds = calculateGeoBounds(
      homeqConfig.centerLat,
      homeqConfig.centerLng,
      homeqConfig.radiusKm
    )

    // Fetch from API
    const response = await ofetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `JWT ${token}`,
      },
      body: {
        min_room: String(filterConfig.minRooms),
        max_room: '10',
        is_early_access: false,
        sorting: 'boost_value.desc',
        geo_bounds: {
          min_lat: geoBounds.min_lat,
          min_lng: geoBounds.min_lng,
          max_lat: geoBounds.max_lat,
          max_lng: geoBounds.max_lng,
        },
        page: 1,
        amount: 100,
      },
      retry: 3,
      retryDelay: 1000,
      timeout: 15000,
      onResponseError: async ({ response }) => {
        if (response.status === 401) {
          consola.warn('[homeq] 401 Unauthorized - token may be expired')
        }
      }
    })

    // Extract listings from response
    const listings = response?.listings || response?.results || response?.data || []

    const mapped: Apartment[] = listings.map((listing: any) => ({
      id: `homeq_${listing.id || listing.listing_id || listing.object_id}`,
      location: listing.address || listing.street || listing.location || 'Unknown',
      price: Number(listing.rent || listing.price || 0),
      rooms: Number(listing.rooms || listing.room_count || 0),
      sqm: Number(listing.sqm || listing.area || listing.size || 0),
      url: listing.url || `https://www.homeq.se/listing/${listing.id || listing.listing_id}`,
      postedAt: new Date(listing.published_at || listing.created_at || listing.available_from || new Date()),
    }))

    consola.success(`[homeq] Fetched ${mapped.length} apartments`)
    return mapped
  } catch (error) {
    consola.error('[homeq] Fetch failed', error)
    return []
  }
}

export const homeqProvider: Provider = {
  name: 'homeq',
  fetchApartments
}
