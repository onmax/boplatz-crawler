# Boplatssyd Crawler

Automated crawler for monitoring apartments in Lund, Dalby, Eslöv on boplatssyd.se

## Features

- Runs daily at 12:00 UTC via Vercel cron
- Filters: locations, price (11k-17k SEK), rooms (2+)
- Telegram notifications with Google Maps links + delete button
- Deduplication via Redis (Vercel KV compatible)

## Setup

1. Install deps: `pnpm install`
2. Copy `.env.example` to `.env`
3. Fill in env vars (Redis URL, Telegram bot token + chat ID)
4. Dev: `pnpm dev`
5. Test: `pnpm test`

## Deploy

```bash
vercel
```

Set env vars in Vercel dashboard, deploy triggers cron automatically.

## Stack

Nitro v3, Vercel Workflow, Redis (unstorage), ofetch, consola, Telegram Bot API
