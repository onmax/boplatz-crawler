import { defineEventHandler } from 'h3'
import { clearAllSeenApartments } from '../../../lib/storage'

export default defineEventHandler(async () => {
  const count = await clearAllSeenApartments()
  return { success: true, cleared: count }
})
