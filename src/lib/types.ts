export type Apartment = {
  id: string
  location: string
  price: number
  rooms: number
  sqm: number
  url: string
  postedAt: Date
}

export type FilterConfig = {
  locations: string[]
  minPrice: number
  maxPrice: number
  minRooms: number
  minSqm: number
}
