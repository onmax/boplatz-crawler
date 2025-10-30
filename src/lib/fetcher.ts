import { ofetch } from 'ofetch'
import { consola } from 'consola'

const GRAPHQL_URL = 'https://www.boplatssyd.se/mypages/api'

const GRAPHQL_QUERY = `query getRentalObjectsAvailable {
  getRentalObjectsAvailable {
    regionNames
    districtNames
    regionDistrictNames
    landlordNames
    allLandlordNames
    allRegionDistrictNames
    allRegionNames
    allBoendeTyp {
      rentalObjectCategoryId
      name
    }
    allOvrigt {
      rentalObjectCategoryId
      name
    }
    rentalObjects {
      rooms
      area
      rentalObjectId
      balcony
      elevator
      street
      rent
      rentFormated
      rentCurrency
      rentDescription
      regionName
      region {
        regionId
      }
      district {
        districtId
      }
      districtName
      imagePrimaryId
      imagePrimaryCdn
      startDate
      startDateFormated
      endDate
      endDateFormated
      moveInDate
      moveInDateFormated
      landlord
      landlordId
      projectName
      latitude
      longitude
      queueTypeId
      queueDefault
      queueTenant
      queueTransfer
      boendeTyp {
        rentalObjectCategoryId
        name
      }
      bostadsTyp {
        rentalObjectCategoryId
        name
      }
      kontraktsTyp {
        rentalObjectCategoryId
        name
      }
      formedlingsTyp {
        rentalObjectCategoryId
        name
      }
      fastighetsStatus {
        rentalObjectCategoryId
        name
      }
      rentalObjectCategories {
        rentalObjectCategoryId
        name
      }
    }
  }
}`

export async function fetchApartments(): Promise<any[]> {
  try {
    consola.info('Fetching apartments from boplatssyd GraphQL API')

    const response = await ofetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: {
        query: GRAPHQL_QUERY,
        operationName: 'getRentalObjectsAvailable',
      },
      retry: 3,
      retryDelay: 1000,
      timeout: 15000,
    })

    const apartments = response?.data?.getRentalObjectsAvailable?.rentalObjects || []

    // Map to our format
    const mapped = apartments.map((apt: any) => ({
      id: String(apt.rentalObjectId),
      location: apt.regionName,
      price: Number(apt.rent),
      rooms: Number(apt.rooms),
      sqm: Number(apt.area),
      url: `https://www.boplatssyd.se/mypages/app?region=${encodeURIComponent(apt.regionName)}#/object/${apt.rentalObjectId}`,
      postedAt: apt.moveInDateFormated || new Date().toISOString(),
    }))

    consola.success(`Fetched ${mapped.length} apartments`)
    return mapped
  } catch (error) {
    consola.error('GraphQL fetch failed', error)
    return []
  }
}
