import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildClientTeamInvitationPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { createClientTeamInvitation } from '@/store/modules/team/actions/createClientTeamInvitation'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ createClientTeamInvitation: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ id: 7 })

const invite = buildClientTeamInvitationPayload({
  partner_team_id: 7
})

const payload: StoreActionPayload<typeof createClientTeamInvitation> = {
  email: 'client@mail.com',
  neuralNetworks: true
}

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(backend, 'createClientTeamInvitation')
    .mockResolvedValue(buildAxiosResponse({ data: invite }))
})

const action = 'team/createClientTeamInvitation'

it('throws when no current team', () => {
  store.commit('team/RESET_ALL')
  expect(store.dispatch(action, payload)).rejects.toThrow(/No current team set/)
})

it('sends request to backend', async () => {
  await store.dispatch(action, payload)
  const expected: Parameters<typeof backend.createClientTeamInvitation>[0] = {
    email: 'client@mail.com',
    neuralNetworks: true,
    teamId: 7
  }
  expect(backend.createClientTeamInvitation).toHaveBeenCalledWith(expected)
})

it('pushes invitation to store', async () => {
  await store.dispatch(action, payload)
  expect(store.state.team.clientTeamInvitations).toEqual([invite])
})

it('returns payload from backend', async () => {
  const response = await store.dispatch(action, payload)
  expect(response).toEqual(expect.objectContaining({ data: invite }))
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'createClientTeamInvitation').mockResolvedValue({ error: fakeError })
  const response = await store.dispatch(action, payload)
  expect(response).toEqual({ error: fakeError })
})
