import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildTeamPayload } from 'test/unit/factories'

import { ProductType } from '@/store/modules/billing/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
})

const defaultParams = { type: ProductType.AnnotationCredits }

beforeEach(() => {
  jest.spyOn(backend, 'updateSubscription')
    .mockResolvedValue(buildAxiosResponse({ data: 'foo' }))
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('billing/setSubscriptionAmount')).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch('billing/setSubscriptionAmount', {
    type: ProductType.AnnotationCredits, value: 55
  })
  expect(backend.updateSubscription).toHaveBeenCalledWith({
    teamId: 7, annotation_credits_standard: 55
  })

  await store.dispatch('billing/setSubscriptionAmount', {
    type: ProductType.AnnotationCredits, value: 99
  })
  expect(backend.updateSubscription).toHaveBeenCalledWith({
    teamId: 7, annotation_credits_standard: 99
  })

  await store.dispatch('billing/setSubscriptionAmount', {
    type: ProductType.Storage, value: 55
  })
  expect(backend.updateSubscription).toHaveBeenCalledWith({
    teamId: 7, storage_standard: 55
  })

  await store.dispatch('billing/setSubscriptionAmount', {
    type: ProductType.Storage, value: 99
  })
  expect(backend.updateSubscription).toHaveBeenCalledWith({
    teamId: 7, storage_standard: 99
  })
})

it('returns response', async () => {
  const response = await store.dispatch('billing/setSubscriptionAmount', defaultParams)
  expect(response.data).toEqual('foo')
})

it('updates billing info in store', async () => {
  expect(store.state.billing.billingInfo).toBeNull()
  await store.dispatch('billing/setSubscriptionAmount', defaultParams)
  expect(store.state.billing.billingInfo).toEqual('foo')
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'updateSubscription').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  expect(await store.dispatch('billing/setSubscriptionAmount', defaultParams))
    .toEqual({ error: { message: 'foo', isValidationError: false } })
  expect(store.state.billing.billingInfo).toBeNull()
})
