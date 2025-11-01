import { describe, it, expect, vi } from 'vitest'
import { boplatssydProvider } from '../../src/lib/providers/boplatssyd'

describe('boplatssydProvider', () => {
  it('has correct name', () => {
    expect(boplatssydProvider.name).toBe('boplatssyd')
  })

  it('fetchApartments returns array', async () => {
    const result = await boplatssydProvider.fetchApartments()
    expect(Array.isArray(result)).toBe(true)
  })
})
