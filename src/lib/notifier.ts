import { Resend } from 'resend'
import { consola } from 'consola'
import type { Apartment } from './types'

// Validate required env vars at module init
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY env var is required')
}
if (!process.env.NOTIFICATION_EMAIL) {
  throw new Error('NOTIFICATION_EMAIL env var is required')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApartmentNotification(apartment: Apartment): Promise<void> {
  try {
    const html = `
      <h2>🏠 New Apartment in ${apartment.location}</h2>
      <ul>
        <li><strong>Location:</strong> ${apartment.location}</li>
        <li><strong>Price:</strong> ${apartment.price} SEK/month</li>
        <li><strong>Rooms:</strong> ${apartment.rooms}</li>
        <li><strong>Size:</strong> ${apartment.sqm} sqm</li>
        <li><strong>Posted:</strong> ${apartment.postedAt.toLocaleDateString()}</li>
      </ul>
      <p><a href="${apartment.url}">View apartment →</a></p>
    `

    await resend.emails.send({
      from: 'Boplatssyd Crawler <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL!,
      subject: `🏠 New apartment: ${apartment.location}`,
      html,
    })

    consola.success(`Email sent for apartment ${apartment.id}`)
  } catch (error) {
    consola.error('Email send failed', { apartment, error })
    throw error
  }
}

export async function sendBatchNotification(apartments: Apartment[]): Promise<void> {
  if (apartments.length === 0) {
    consola.info('No new apartments to notify')
    return
  }

  consola.info(`Sending ${apartments.length} notifications`)

  for (let i = 0; i < apartments.length; i++) {
    const apt = apartments[i]
    try {
      await sendApartmentNotification(apt)
      // Add delay to avoid hitting Resend rate limits (except for last email)
      if (i < apartments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    } catch (error) {
      // Log but continue with other notifications
      consola.error(`Failed to notify for ${apt.id}`, error)
    }
  }
}
