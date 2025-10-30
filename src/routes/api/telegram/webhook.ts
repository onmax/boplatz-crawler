import { defineEventHandler, readBody } from 'h3'
import { consola } from 'consola'

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export default defineEventHandler(async (event) => {
  try {
    const update = await readBody(event)

    // Handle callback query (button press)
    if (update.callback_query) {
      const { callback_query } = update
      const { data, message } = callback_query

      if (data === 'delete_msg' && message) {
        // Delete the message
        const deleteUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/deleteMessage`
        await fetch(deleteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            message_id: message.message_id
          })
        })

        // Answer the callback to remove loading state
        const answerUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`
        await fetch(answerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callback_query.id,
            text: 'Message deleted'
          })
        })

        consola.info('Deleted message', { message_id: message.message_id })
      }
    }

    return { ok: true }
  } catch (error) {
    consola.error('Telegram webhook error', error)
    return { ok: false, error: String(error) }
  }
})
