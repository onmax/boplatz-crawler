import { consola } from 'consola'
import type { Provider } from './base'
import type { Apartment } from '../types'
import { boplatssydProvider } from './boplatssyd'
import { homeqProvider } from './homeq'

const providers: Provider[] = [
  boplatssydProvider,
  homeqProvider,
]

export async function fetchAllApartments(): Promise<Apartment[]> {
  consola.info(`Fetching from ${providers.length} providers in parallel`)

  const results = await Promise.allSettled(
    providers.map(provider => provider.fetchApartments())
  )

  const allApartments: Apartment[] = []

  results.forEach((result, index) => {
    const provider = providers[index]

    if (result.status === 'fulfilled') {
      consola.success(`[${provider.name}] Returned ${result.value.length} apartments`)
      allApartments.push(...result.value)
    } else {
      consola.error(`[${provider.name}] Failed:`, result.reason)
    }
  })

  consola.info(`Total apartments from all providers: ${allApartments.length}`)
  return allApartments
}
