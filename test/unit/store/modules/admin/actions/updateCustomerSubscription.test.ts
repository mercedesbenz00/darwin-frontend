import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAdminTeamPayload, buildCustomerSubscriptionPayload, buildAxiosResponse } from 'test/unit/factories'

import {
  updateCustomerSubscription
} from '@/store/modules/admin/actions/updateCustomerSubscription'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateCustomerSubscription: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let payload: StoreActionPayload<typeof updateCustomerSubscription>
let teamPayload: ReturnType<typeof buildAdminTeamPayload>
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()

  teamPayload = buildAdminTeamPayload({
    id: 3,
    customer_v3: {
      customer_subscription: buildCustomerSubscriptionPayload({
        annotation_credits_standard: 100,
        annotation_credits_bonus: 20
      })
    }
  })

  payload = {
    team: teamPayload,
    seconds_per_automation_action: 52,
    storage_extra: 20
  }

  jest.spyOn(backend, 'updateCustomerSubscription').mockResolvedValue(buildAxiosResponse({ data: teamPayload }))
})

const ACTION = 'admin/updateCustomerSubscription'

it('calls correct api endpoint', async () => {
  await store.dispatch(ACTION, payload)

  const expected: Parameters<typeof backend.updateCustomerSubscription>[0] = {
    teamId: 3,
    seconds_per_automation_action: 52,
    storage_extra: 20
  }

  expect(backend.updateCustomerSubscription).toHaveBeenCalledWith(expected)
})

it('pushes updated team to store', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.admin.teams).toEqual([teamPayload])
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'updateCustomerSubscription').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const response = await store.dispatch(ACTION, payload)

  expect(response).toEqual({ error: { message: 'foo', isValidationError: false } })
})
