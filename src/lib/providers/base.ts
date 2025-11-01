import type { Apartment } from '../types'

export type Provider = {
  name: string
  fetchApartments: () => Promise<Apartment[]>
}
