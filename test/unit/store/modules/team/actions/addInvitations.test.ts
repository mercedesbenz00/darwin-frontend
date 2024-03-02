import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildInvitationPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { AddInvitationsPayload } from '@/store/modules/team/actions/addInvitations'
import { InvitationPayload } from '@/store/types'
import { api, errorMessages } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
let params: AddInvitationsPayload
const invitations: InvitationPayload[] = [
  buildInvitationPayload({
    id: 1,
    team_id: 1,
    email: 'member@v7labs.com',
    role: 'member'
  })
]

mockApi()

beforeEach(() => {
  params = {
    teamId: 1,
    invitations: [{ email: 'member@v7labs.com', role: 'member' }]
  }
  store = createUnstubbedTestStore()

  jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: invitations }))
})

it('calls correct API endpoint', async () => {
  await store.dispatch('team/addInvitations', params)
  await flushPromises()

  expect(api.post).toHaveBeenCalledWith(
    'teams/1/invitations',
    { invitations: params.invitations }
  )
})

it('commit invitations to the store', async () => {
  expect(store.state.team.invitations).toHaveLength(0)
  await store.dispatch('team/addInvitations', params)
  await flushPromises()
  expect(store.state.team.invitations).toHaveLength(invitations.length)
})

it('returns the backend response', async () => {
  const response = await store.dispatch('team/addInvitations', params)
  await flushPromises()

  expect(response.data).toEqual(invitations)
})

it('returns the error when the request fails', async () => {
  const unauthorizedError = {
    response: { status: 401 }
  }
  jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
  const response = await store.dispatch('team/addInvitations', params)
  await flushPromises()

  expect(response).toEqual({
    error: expect.objectContaining({
      status: 401,
      message: errorMessages.TEAM_MEMBERS_ADD_INVITATIONS[401]
    })
  })
})
