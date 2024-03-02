import { Country } from '@/store/modules/billing/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Retrieve list of supported countries from backend
 */
export const loadCountries = async () => {
  const path = 'addresses/countries'

  let response

  try {
    response = await get<Country[]>(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.COUNTRIES_LOAD)
  }
  return response
}
