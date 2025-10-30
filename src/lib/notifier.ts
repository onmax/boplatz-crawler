import { consola } from 'consola'
import type { Apartment } from './types'

// Validate required env vars at module init
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN env var is required')
}
if (!process.env.TELEGRAM_CHAT_ID) {
  throw new Error('TELEGRAM_CHAT_ID env var is required')
}

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendApartmentNotification(apartment: Apartment): Promise<void> {
  try {
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apartment.location + ', Sweden')}`

    const message = `🏠 *New Apartment in ${apartment.location}*

📍 *Location:* ${apartment.location}
💰 *Price:* ${apartment.price} SEK/month
🛏️ *Rooms:* ${apartment.rooms}
📏 *Size:* ${apartment.sqm} sqm
📅 *Posted:* ${apartment.postedAt.toLocaleDateString()}

🔗 [View apartment](${apartment.url}) | 🗺️ [Google Maps](${gmapsUrl})`

    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[
            { text: '👎 Not interested', callback_data: `delete_msg` }
          ]]
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    consola.success(`Telegram notification sent for apartment ${apartment.id}`)
  } catch (error) {
    consola.error('Telegram notification failed', { apartment, error })
    throw error
  }
}

export async function sendBatchNotification(apartments: Apartment[]): Promise<{ sent: number, failed: number }> {
  if (apartments.length === 0) {
    consola.info('No new apartments to notify')
    return { sent: 0, failed: 0 }
  }

  consola.info(`Sending ${apartments.length} notifications`)

  let sent = 0
  let failed = 0

  for (let i = 0; i < apartments.length; i++) {
    const apt = apartments[i]
    try {
      await sendApartmentNotification(apt)
      sent++
      // Add delay to avoid hitting Telegram rate limits (except for last message)
      if (i < apartments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    } catch (error) {
      failed++
      // Log but continue with other notifications
      consola.error(`Failed to notify for ${apt.id}`, error)
    }
  }

  consola.info(`Notifications complete: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}
