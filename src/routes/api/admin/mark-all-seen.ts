import { defineEventHandler } from 'h3'
import { consola } from 'consola'
import { fetchApartments } from '../../../lib/fetcher'
import { parseApartments } from '../../../lib/parser'
import { markApartmentSeen } from '../../../lib/storage'

export default defineEventHandler(async () => {
  try {
    consola.info('Fetching all apartments to mark as seen')
    const rawData = await fetchApartments()
    const apartments = parseApartments(rawData)

    consola.info(`Marking ${apartments.length} apartments as seen`)
    for (const apt of apartments) {
      await markApartmentSeen(apt.id)
    }

    consola.success(`Marked ${apartments.length} apartments as seen`)
    return { success: true, marked: apartments.length }
  } catch (error) {
    consola.error('Failed to mark apartments as seen', error)
    return { success: false, error: String(error) }
  }
})
