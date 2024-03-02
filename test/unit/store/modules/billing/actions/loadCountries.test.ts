import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildCountry } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadCountries: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const countries = [buildCountry({})]

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadCountries')
    .mockResolvedValue(buildAxiosResponse({ data: countries }))
})

it('sends request to backend', async () => {
  await store.dispatch('billing/loadCountries')
  expect(backend.loadCountries).toHaveBeenCalledWith()
})

it('returns response', async () => {
  const response = await store.dispatch('billing/loadCountries')
  expect(response.data).toEqual(countries)
})

it('updates credit usage in store', async () => {
  expect(store.state.billing.countries).toEqual([])
  await store.dispatch('billing/loadCountries')
  expect(store.state.billing.countries).toEqual(countries)
})
