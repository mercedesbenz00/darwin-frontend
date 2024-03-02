import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildBillingInfoPayload,
  buildBillingInfoSelectedSource,
  buildParsedError,
  buildTeamPayload
} from 'test/unit/factories'

import { BillingInfoPayload } from '@/store/modules/billing/types'
import * as backend from '@/utils/backend'
import * as stripeUtils from '@/utils/stripe'

jest.mock('@/utils/backend', () => ({ updateCard: jest.fn() }))
jest.mock('@/utils/stripe', () => ({ stripe: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ slug: 'v7' })

let billingInfo: BillingInfoPayload
let selectedSource: BillingInfoPayload['selected_source']

const actionParams = { card: '1111-1111-1111-1111-1111' }
const backendParams = {
  teamId: v7.id,
  token: 'stripe-token'
}

let stripeMock: jest.SpyInstance

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'updateCard')
    .mockResolvedValue(buildAxiosResponse({ data: { selected_source: selectedSource } }))

  stripeMock = jest.spyOn(stripeUtils, 'stripe')
    .mockReturnValue({ createToken: () => Promise.resolve({ token: { id: 'stripe-token' } }) } as any)

  billingInfo = buildBillingInfoPayload({})
  selectedSource = buildBillingInfoSelectedSource()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('billing/SET_BILLING_INFO', billingInfo)
})

afterEach(() => {
  stripeMock.mockReset()
})

it('throws if stripe not ready', async () => {
  jest.spyOn(stripeUtils, 'stripe').mockReturnValue(null as any)
  await expect(
    store.dispatch('billing/updateCard', actionParams)
  ).rejects.toThrow(/Stripe service is not available/)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(
    store.dispatch('billing/updateCard', actionParams)
  ).rejects.toThrow(/team is not set/)
})

it('sends request to backend', async () => {
  await store.dispatch('billing/updateCard', actionParams)
  expect(backend.updateCard).toHaveBeenCalledWith(backendParams)
})

it('returns response', async () => {
  const response = await store.dispatch('billing/updateCard', actionParams)
  expect(response.data).toEqual({ selected_source: selectedSource })
})

it('updates credit usage in store', async () => {
  expect(store.state.billing.billingInfo!.selected_source).toBeNull()
  await store.dispatch('billing/updateCard', actionParams)
  expect(store.state.billing.billingInfo!.selected_source).toEqual(selectedSource)
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'updateCard').mockResolvedValue(buildParsedError({ message: 'foo' }))
  expect(await store.dispatch('billing/updateCard', actionParams))
    .toEqual({ error: expect.objectContaining({ message: 'foo' }) })
  expect(store.state.billing.billingInfo!.selected_source).toBeNull()
})
