# HomeQ Provider Setup

## Prerequisites

1. HomeQ account with valid credentials
2. Email and password for authentication

## Configuration

Add these environment variables:

```bash
HOMEQ_EMAIL=your-email@example.com
HOMEQ_PASSWORD=your-password
HOMEQ_CENTER_LAT=55.7047  # Lund center
HOMEQ_CENTER_LNG=13.1910  # Lund center
HOMEQ_RADIUS_KM=20         # 20km radius
```

## How It Works

1. Auth service manages JWT token lifecycle
2. Token cached in Redis/KV with 7-day expiry
3. Auto-refreshes on 401 or near expiry
4. Geo service calculates lat/lng bounds from center + radius
5. Provider fetches apartments within bounds
6. Results merged with boplatssyd provider

## Troubleshooting

**No apartments from homeq:**
- Check HOMEQ_CENTER_LAT/LNG are set
- Verify credentials are correct
- Check logs for auth errors

**401 errors:**
- Token may be expired (should auto-refresh)
- Check credentials are valid
- Clear cache and retry

**Missing geo config:**
- Provider automatically disabled if HOMEQ_CENTER_LAT/LNG missing
- Check logs for warnings
