import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildBillingInfoPayload,
  buildCustomerSubscriptionPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { resetClientUsageLimit } from '@/store/modules/billing/actions/resetClientUsageLimit'
import { ProductType } from '@/store/modules/billing/types'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateTeamUsageLimit: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('billing/SET_BILLING_INFO', buildBillingInfoPayload({
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_standard_max_in_period: 100,
      storage_standard_max_in_period: 25000
    })
  }))

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('setClientUsageLimit')
    ) {
      return dispatch(action, payload, opts)
    } else {
      return Promise.resolve({ data: {} })
    }
  })

  store.dispatch = mockDispatch

  jest.spyOn(backend, 'updateTeamUsageLimit').mockResolvedValue(buildAxiosResponse({ data: 'foo' }))
})

const payload: StoreActionPayload<typeof resetClientUsageLimit> = {
  client: buildTeamPayload({ slug: 'v7-client' }),
  type: ProductType.AnnotationCredits
}

const ACTION = 'billing/resetClientUsageLimit'

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.updateTeamUsageLimit).toHaveBeenCalledWith({ teamSlug: 'v7-client', credits: 100 })

  await store.dispatch(ACTION, { ...payload, type: ProductType.Storage })
  expect(backend.updateTeamUsageLimit).toHaveBeenCalledWith({ teamSlug: 'v7-client', storage: 25000 })
})

it('on success, dispatches to reload partner info', async () => {
  await store.dispatch(ACTION, payload)

  expect(store.dispatch).toHaveBeenCalledWith('billing/loadBillingInfo', undefined)
  expect(store.dispatch).toHaveBeenCalledWith('billing/loadCreditUsage', undefined)
})

it('returns response', async () => {
  expect(await store.dispatch(ACTION, payload)).toEqual(expect.objectContaining({ data: 'foo' }))
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'updateTeamUsageLimit').mockResolvedValue({ error: fakeError })
  expect(await store.dispatch(ACTION, payload)).toEqual({ error: fakeError })
})

it('on failure, does not dispatch to reload partner info', async () => {
  jest.spyOn(backend, 'updateTeamUsageLimit').mockResolvedValue({ error: fakeError })
  await store.dispatch(ACTION, payload)

  expect(store.dispatch).not.toHaveBeenCalledWith('billing/loadBillingInfo', undefined)
  expect(store.dispatch).not.toHaveBeenCalledWith('billing/loadCreditUsage', undefined)
})
