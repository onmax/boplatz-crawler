import { describe, it, expect } from 'vitest'
import { calculateGeoBounds } from '../../src/lib/services/geo'

describe('calculateGeoBounds', () => {
  it('calculates bounds for Lund center 20km radius', () => {
    const bounds = calculateGeoBounds(55.7047, 13.1910, 20)

    // 20km ≈ 0.18° lat, ~0.32° lng at this latitude
    expect(bounds.min_lat).toBeCloseTo(55.52, 1)
    expect(bounds.max_lat).toBeCloseTo(55.88, 1)
    expect(bounds.min_lng).toBeCloseTo(12.87, 1)
    expect(bounds.max_lng).toBeCloseTo(13.51, 1)
  })

  it('handles different radius', () => {
    const bounds = calculateGeoBounds(55.7047, 13.1910, 10)
    const latDiff = bounds.max_lat - bounds.min_lat
    expect(latDiff).toBeCloseTo(0.18, 1)
  })

  it('validates positive radius', () => {
    expect(() => calculateGeoBounds(55.7047, 13.1910, -5)).toThrow('Radius must be positive')
  })
})
