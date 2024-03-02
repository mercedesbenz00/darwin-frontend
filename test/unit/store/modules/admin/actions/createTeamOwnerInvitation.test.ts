import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildTeamOwnerInvitationPayload } from 'test/unit/factories'

import { createTeamOwnerInvitation } from '@/store/modules/admin/actions/createTeamOwnerInvitation'
import { normalizeTeamOwnerInvitation } from '@/store/modules/admin/utils'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ createRegularTeamInvitation: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const data = buildTeamOwnerInvitationPayload({
  id: 1,
  email: 'user1@example.com',
  credit_amount: 3600 * 1000,
  credit_expiration_in_days: 20,
  team: null
})

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'createRegularTeamInvitation').mockResolvedValue(
    buildAxiosResponse({ data })
  )
})

const payload: StoreActionPayload<typeof createTeamOwnerInvitation> = {
  email: 'user1@example.com',
  creditAmount: 20,
  creditExpirationInDays: 12
}

const ACTION = 'admin/createTeamOwnerInvitation'

it('calls correct api endpoint', async () => {
  await store.dispatch(ACTION, payload)
  const expected: Parameters<typeof backend.createRegularTeamInvitation>[0] = payload
  expect(backend.createRegularTeamInvitation).toHaveBeenCalledWith(expected)
})

it('returns raw data from backend', async () => {
  const { data } = await store.dispatch(ACTION, payload)
  expect(data).toEqual(data)
})

it('commits invitations to store', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.admin.teamOwnerInvitations).toEqual([normalizeTeamOwnerInvitation(data)])
})

it('returns parsed error on failure', async () => {
  const mockError = {
    message: 'foo',
    isValidationError: true
  }
  jest.spyOn(backend, 'createRegularTeamInvitation').mockResolvedValue({
    error: mockError
  })
  const { error } = await store.dispatch(ACTION, payload)
  expect(error).toEqual(mockError)
})
