import { describe, it, expect } from 'vitest'
import type { Provider } from '../../src/lib/providers/base'
// Import something at runtime to ensure module exists
import '../../src/lib/providers/base'

describe('Provider interface', () => {
  it('should define correct structure', () => {
    const mockProvider: Provider = {
      name: 'test',
      fetchApartments: async () => []
    }
    expect(mockProvider.name).toBe('test')
    expect(typeof mockProvider.fetchApartments).toBe('function')
  })
})
