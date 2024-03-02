import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildCreditUsagePayload,
  buildCreditUsagePayloadV2,
  buildTeamPayload
} from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadCreditUsage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ slug: 'v7' })

const defaultParams = {
  teamSlug: v7.slug,
  type: 'annotation_credits'
}

const creditUsage = buildCreditUsagePayload()

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadCreditUsage')
    .mockResolvedValue(buildAxiosResponse({ data: creditUsage }))
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('billing/loadCreditUsage')).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch('billing/loadCreditUsage')
  expect(backend.loadCreditUsage).toHaveBeenCalledWith(defaultParams)
})

it('returns response', async () => {
  const response = await store.dispatch('billing/loadCreditUsage', defaultParams)
  expect(response.data).toEqual(creditUsage)
})

it('updates credit usage in store', async () => {
  expect(store.state.billing.creditUsage).toBeNull()
  await store.dispatch('billing/loadCreditUsage', defaultParams)
  expect(store.state.billing.creditUsage).toEqual(creditUsage)
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'loadCreditUsage')
    .mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  expect(await store.dispatch('billing/loadCreditUsage', defaultParams))
    .toEqual({ error: { message: 'foo', isValidationError: false } })
  expect(store.state.billing.creditUsage).toBeNull()
})

describe('with Ticket', () => {
  const creditUsageV2 = buildCreditUsagePayloadV2()

  beforeEach(() => {
    store.commit('features/SET_FEATURES', [{ name: 'TICKER_UI', enabled: true }])

    jest.spyOn(backend, 'loadCreditUsage')
      .mockResolvedValue(buildAxiosResponse({ data: creditUsageV2 }))
  })

  it('sends request to backend', async () => {
    await store.dispatch('billing/loadCreditUsage')
    expect(backend.loadCreditUsage).toHaveBeenCalledWith({
      ...defaultParams,
      type: 'ticks'
    })
  })

  it('updates credit usage in store', async () => {
    expect(store.state.billing.creditUsageV2).toBeNull()
    await store.dispatch('billing/loadCreditUsage', {
      ...defaultParams,
      type: 'ticks'
    })
    expect(store.state.billing.creditUsageV2).toEqual(creditUsageV2)
  })
})
