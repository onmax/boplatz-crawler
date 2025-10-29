import { z } from 'zod'

export const apartmentSchema = z.object({
  id: z.string(),
  location: z.string(),
  price: z.number().positive(),
  rooms: z.number().positive(),
  sqm: z.number().positive(),
  url: z.string().url(),
  postedAt: z.coerce.date(),
})

export const filterConfigSchema = z.object({
  locations: z.array(z.string()),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  minRooms: z.number().positive(),
})
