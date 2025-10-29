import { ofetch } from 'ofetch'
import { consola } from 'consola'

const BOPLATSSYD_URL = 'https://boplatssyd.se'

export async function fetchApartments(): Promise<any[]> {
  try {
    // Try API endpoint first (inspect network tab to find actual endpoint)
    // This is placeholder - need to investigate actual boplatssyd API
    consola.info('Fetching apartments from boplatssyd API')

    const response = await ofetch(`${BOPLATSSYD_URL}/api/apartments`, {
      retry: 3,
      retryDelay: 1000,
      timeout: 10000,
    })

    consola.success(`Fetched ${response.length} apartments`)
    return response
  } catch (error) {
    consola.warn('API fetch failed, trying mdream fallback', error)
    return await fetchWithMdream()
  }
}

async function fetchWithMdream(): Promise<any[]> {
  try {
    consola.info('Fetching with mdream')

    // Use mdream to scrape as markdown
    // TODO: Parse markdown output to extract apartment data
    // For now return empty array

    consola.warn('Mdream parsing not implemented yet')
    return []
  } catch (error) {
    consola.error('Mdream fetch failed', error)
    return []
  }
}
