import { buildCountry, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { Country } from '@/store/modules/billing/types'
import { api } from '@/utils'
import { loadCountries } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let countries: Country[]

beforeEach(() => {
  countries = [buildCountry({})]
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: countries }))
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadCountries()
  expect(apiGet).toHaveBeenCalledWith('addresses/countries')
})

it('returns response from backend', async () => {
  const response = await loadCountries()
  expect(response).toEqual(expect.objectContaining({ data: countries }))
})
