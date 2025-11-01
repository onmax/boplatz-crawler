import { ofetch } from 'ofetch'
import { consola } from 'consola'
import type { Provider } from './base'
import type { Apartment } from '../types'

const GRAPHQL_URL = 'https://www.boplatssyd.se/mypages/api'

const GRAPHQL_QUERY = `query getRentalObjectsAvailable {
  getRentalObjectsAvailable {
    rentalObjects {
      rooms
      area
      rentalObjectId
      street
      rent
      rentFormated
      regionName
      imagePrimaryCdn
      moveInDateFormated
    }
  }
}`

async function fetchApartments(): Promise<Apartment[]> {
  try {
    consola.info('[boplatssyd] Fetching apartments')

    const response = await ofetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: {
        query: GRAPHQL_QUERY,
        operationName: 'getRentalObjectsAvailable',
      },
      retry: 3,
      retryDelay: 1000,
      timeout: 15000,
    })

    const apartments = response?.data?.getRentalObjectsAvailable?.rentalObjects || []

    const mapped = apartments.map((apt: any) => ({
      id: String(apt.rentalObjectId),
      location: apt.regionName,
      price: Number(apt.rent),
      rooms: Number(apt.rooms),
      sqm: Number(apt.area),
      url: `https://www.boplatssyd.se/mypages/app?region=${encodeURIComponent(apt.regionName)}#/object/${apt.rentalObjectId}`,
      postedAt: apt.moveInDateFormated ? new Date(apt.moveInDateFormated) : new Date(),
    }))

    consola.success(`[boplatssyd] Fetched ${mapped.length} apartments`)
    return mapped
  } catch (error) {
    consola.error('[boplatssyd] Fetch failed', error)
    return []
  }
}

export const boplatssydProvider: Provider = {
  name: 'boplatssyd',
  fetchApartments
}
