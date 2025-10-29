import { defineEventHandler } from 'h3'
import { consola } from 'consola'
import { fetchApartments } from '../../../lib/fetcher'
import { parseApartments } from '../../../lib/parser'
import { filterApartments } from '../../../lib/filter'
import { getFilterConfig } from '../../../lib/config'
import { filterNewApartments, markApartmentSeen } from '../../../lib/storage'
import { sendBatchNotification } from '../../../lib/notifier'

export default defineEventHandler(async (event) => {
  consola.info('🚀 Starting apartment check workflow')

  const stats = {
    fetched: 0,
    parsed: 0,
    filtered: 0,
    new: 0,
    notified: 0,
    errors: 0,
  }

  try {
    // Step 1: Fetch
    consola.info('Step 1: Fetching apartments')
    const rawData = await fetchApartments()
    stats.fetched = rawData.length

    // Step 2: Parse
    consola.info('Step 2: Parsing apartments')
    const apartments = parseApartments(rawData)
    stats.parsed = apartments.length

    // Step 3: Filter
    consola.info('Step 3: Filtering apartments')
    const config = getFilterConfig()
    const filtered = filterApartments(apartments, config)
    stats.filtered = filtered.length

    // Step 4: Check new
    consola.info('Step 4: Checking for new apartments')
    const apartmentIds = filtered.map(a => a.id)
    const newIds = await filterNewApartments(apartmentIds)
    const newApartments = filtered.filter(a => newIds.includes(a.id))
    stats.new = newApartments.length

    // Step 5: Notify
    consola.info('Step 5: Sending notifications')
    await sendBatchNotification(newApartments)
    stats.notified = newApartments.length

    // Step 6: Mark as seen
    consola.info('Step 6: Updating state')
    for (const id of newIds) {
      await markApartmentSeen(id)
    }

    consola.success('✅ Workflow completed', stats)

    return {
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    stats.errors++
    consola.error('❌ Workflow failed', error)

    return {
      success: false,
      stats,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
})
