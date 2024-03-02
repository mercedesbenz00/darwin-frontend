import { BillingAction, Country } from '@/store/modules/billing/types'
import { loadCountries as request } from '@/utils/backend'

type LoadCountries = BillingAction<void, Country[]>

/**
 * Retrieve billing information for current team
 */
export const loadCountries: LoadCountries = async ({ commit }) => {
  const response = await request()
  if ('data' in response) {
    commit(
      'SET_COUNTRIES',
      response.data.sort((a: Country, b: Country) => a.name.localeCompare(b.name))
    )
  }
  return response
}
