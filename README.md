# Boplatssyd Crawler

Automated crawler for monitoring apartments in Lund, Dalby, Eslöv on boplatssyd.se

## Features

- Runs every 12h via Vercel cron
- Filters: locations, price (11k-17k SEK), rooms (2+)
- Email notifications for new matches
- Deduplication via Vercel KV

## Setup

1. Install deps: `pnpm install`
2. Copy `.env.example` to `.env`
3. Fill in env vars (Vercel KV, Resend API key)
4. Dev: `pnpm dev`
5. Test: `pnpm test`

## Deploy

```bash
vercel
```

Set env vars in Vercel dashboard, deploy triggers cron automatically.

## Stack

Nitro v3, Vercel Workflow, Vercel KV, ofetch, unstorage, consola, Resend
