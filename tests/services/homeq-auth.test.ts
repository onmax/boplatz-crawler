import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getHomeqToken, refreshHomeqToken } from '../../src/lib/services/homeq-auth'

// Mock ofetch
vi.mock('ofetch', () => ({
  ofetch: vi.fn(() => Promise.resolve({ token: 'mock-jwt-token-12345' }))
}))

// Mock unstorage with in-memory storage
const mockStorage = new Map<string, any>()
vi.mock('unstorage', () => ({
  createStorage: vi.fn(() => ({
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage.get(key) || null)),
    setItem: vi.fn((key: string, value: any) => { mockStorage.set(key, value); return Promise.resolve() }),
    removeItem: vi.fn((key: string) => { mockStorage.delete(key); return Promise.resolve() })
  }))
}))

describe('homeq-auth', () => {
  beforeEach(() => {
    vi.stubEnv('HOMEQ_EMAIL', 'test@example.com')
    vi.stubEnv('HOMEQ_PASSWORD', 'testpass123')
    mockStorage.clear()
  })

  it('returns token string from cache', async () => {
    // Pre-populate cache
    mockStorage.set('homeq:jwt_token', 'cached-token-123')
    mockStorage.set('homeq:jwt_expiry', Date.now() + 100000)

    const token = await getHomeqToken()
    expect(typeof token).toBe('string')
    expect(token).toBe('cached-token-123')
  })

  it('refreshes token when cache expired', async () => {
    // Set expired cache
    mockStorage.set('homeq:jwt_token', 'old-token')
    mockStorage.set('homeq:jwt_expiry', Date.now() - 1000)

    const token = await getHomeqToken()
    expect(typeof token).toBe('string')
    expect(token).toBe('mock-jwt-token-12345')
  })

  it('refreshes token successfully', async () => {
    const token = await refreshHomeqToken()
    expect(typeof token).toBe('string')
    expect(token).toBe('mock-jwt-token-12345')
  })

  it('throws on missing credentials', async () => {
    vi.stubEnv('HOMEQ_EMAIL', '')
    vi.stubEnv('HOMEQ_PASSWORD', '')
    await expect(refreshHomeqToken()).rejects.toThrow('HOMEQ_EMAIL and HOMEQ_PASSWORD must be set')
  })
})
