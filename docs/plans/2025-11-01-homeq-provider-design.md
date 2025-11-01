# HomeQ Provider Design

**Date**: 2025-11-01
**Status**: Design Phase

## Overview

Add homeq.se as additional apartment provider alongside boplatssyd. Multi-provider architecture with provider abstraction, auto-refresh JWT auth, and geo-based filtering.

## Requirements

- Fetch apartments from homeq.se API (20km radius from Lund)
- Auto-refresh JWT authentication with user credentials
- Configurable geo bounds (center + radius)
- Map room filters from existing config
- Merge with boplatssyd results
- Isolated provider failures (one fails, others continue)

## Architecture

### Core Abstraction

```ts
type Provider = {
  name: string
  fetchApartments: () => Promise<Apartment[]>
}
```

### Directory Structure

```
lib/
├── providers/
│   ├── base.ts           # Provider type definition
│   ├── boplatssyd.ts     # Existing logic extracted
│   ├── homeq.ts          # New homeq implementation
│   └── registry.ts       # Provider orchestration
└── services/
    ├── homeq-auth.ts     # JWT token management
    └── geo.ts            # Lat/lng bounds calculation
```

### Provider Registry

```ts
// lib/providers/registry.ts
const providers: Provider[] = [boplatssydProvider, homeqProvider]

export async function fetchAllApartments() {
  const results = await Promise.allSettled(
    providers.map(p => p.fetchApartments())
  )
  // Handle partial failures, merge successful results
}
```

## Components

### HomeQ Authentication

**File**: `lib/services/homeq-auth.ts`

- Store credentials: `HOMEQ_EMAIL`, `HOMEQ_PASSWORD`
- Token cached in Redis/KV with expiry tracking
- Auto-refresh on 401 or near expiry
- Research needed: HomeQ login API endpoint

### Geo Bounds Calculation

**File**: `lib/services/geo.ts`

- Config: `HOMEQ_CENTER_LAT`, `HOMEQ_CENTER_LNG`, `HOMEQ_RADIUS_KM`
- Convert radius to lat/lng bounds using haversine
- Formula: 1° lat ≈ 111km, 1° lng ≈ 111km * cos(lat)
- Returns: `{ min_lat, max_lat, min_lng, max_lng }`

### HomeQ Provider

**File**: `lib/providers/homeq.ts`

- API: `POST https://api.homeq.se/api/v3/search`
- Request body:
  ```json
  {
    "min_room": <from FILTER_MIN_ROOMS>,
    "max_room": 10,
    "geo_bounds": <from geo service>,
    "sorting": "boost_value.desc",
    "page": 1,
    "amount": 9
  }
  ```
- Map response to `Apartment[]`
- ID strategy: prefix with `homeq_` to avoid collisions

### Boplatssyd Provider

**File**: `lib/providers/boplatssyd.ts`

- Extract existing logic from `lib/fetcher.ts`
- No changes to functionality
- Wrap in Provider interface

## Data Flow

1. **Fetch**: `registry.fetchAllApartments()` calls all providers in parallel
2. **Merge**: Combine results from all successful providers
3. **Dedupe**: Use ID (homeq_ prefix vs numeric)
4. **Parse/Filter/Notify**: Existing workflow unchanged

## Error Handling

### Provider Isolation
- `Promise.allSettled` ensures partial success
- Failed provider logs error, returns empty array
- Workflow continues with available results

### Auth Failures
- 401 → auto-refresh token once
- Refresh fails → log error, return empty results
- Invalid credentials → fail fast with clear error

### Geo Validation
- Missing `HOMEQ_CENTER_LAT/LNG` → disable homeq provider
- Invalid radius → default to 20km

## Configuration

### New Env Vars

```bash
# HomeQ Auth
HOMEQ_EMAIL=user@example.com
HOMEQ_PASSWORD=password

# HomeQ Geo
HOMEQ_CENTER_LAT=55.7047
HOMEQ_CENTER_LNG=13.1910
HOMEQ_RADIUS_KM=20
```

### Existing Config Reuse
- `FILTER_MIN_ROOMS` → homeq `min_room`
- Max rooms hardcoded to 10 (or make configurable)

## Migration Strategy

1. Extract boplatssyd logic to provider
2. Build homeq provider with auth + geo
3. Update `lib/fetcher.ts` to use registry
4. Update workflow to handle merged results
5. Add tests for multi-provider orchestration

## Open Questions

- HomeQ login API endpoint (need to reverse-engineer or find docs)
- Exact response structure (may differ from curl example)
- Rate limiting behavior on homeq API
- Pagination strategy (currently fetching 9 per page)

## Success Criteria

- Both providers fetch in parallel
- Homeq returns apartments within 20km of Lund
- JWT auto-refreshes on expiry
- Workflow handles partial failures gracefully
- No duplicate apartments in notifications
