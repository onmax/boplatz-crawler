export type GeoBounds = {
  min_lat: number
  max_lat: number
  min_lng: number
  max_lng: number
}

export function calculateGeoBounds(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): GeoBounds {
  if (radiusKm <= 0) throw new Error('Radius must be positive')

  // 1° latitude ≈ 111km
  const latDelta = radiusKm / 111

  // 1° longitude ≈ 111km * cos(lat)
  const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))

  return {
    min_lat: centerLat - latDelta,
    max_lat: centerLat + latDelta,
    min_lng: centerLng - lngDelta,
    max_lng: centerLng + lngDelta
  }
}
