import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildBillingInfoPayload, buildTeamPayload } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadBillingInfo: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ slug: 'v7' })

const billingInfo = buildBillingInfoPayload({})

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadBillingInfo')
    .mockResolvedValue(buildAxiosResponse({ data: billingInfo }))
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('billing/loadBillingInfo')).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch('billing/loadBillingInfo')
  expect(backend.loadBillingInfo).toHaveBeenCalledWith(v7.id)
})

it('returns response', async () => {
  const response = await store.dispatch('billing/loadBillingInfo', v7.id)
  expect(response.data).toEqual(billingInfo)
})

it('updates credit usage in store', async () => {
  expect(store.state.billing.billingInfo).toBeNull()
  await store.dispatch('billing/loadBillingInfo', v7.id)
  expect(store.state.billing.billingInfo).toEqual(billingInfo)
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'loadBillingInfo').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  expect(await store.dispatch('billing/loadBillingInfo', v7.id))
    .toEqual({ error: { message: 'foo', isValidationError: false } })
  expect(store.state.billing.billingInfo).toBeNull()
})
