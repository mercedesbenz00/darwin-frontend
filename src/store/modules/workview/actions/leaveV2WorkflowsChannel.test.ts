import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildV2DatasetItemPayload } from 'test/unit/factories'
import { buildTeamPayload } from 'test/unit/factories/buildTeamPayload'

import { StoreActionPayload } from '@/store/types'
import { TeamPayload } from '@/store/types/TeamPayload'
import { Socket } from '@/utils'

import { getItemChannelTopic } from './joinV2WorkflowsChannel'
import { leaveV2WorkflowsChannel } from './leaveV2WorkflowsChannel'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(Socket, 'leave').mockResolvedValue(undefined)
})

const ACTION = 'workview/leaveV2WorkflowsChannel'
const PAYLOAD: StoreActionPayload<typeof leaveV2WorkflowsChannel> = buildV2DatasetItemPayload()

let currentTeam: TeamPayload

beforeEach(() => {
  currentTeam = buildTeamPayload({ id: 1 })
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
})

it('leaves channel', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(Socket.leave).toHaveBeenCalledWith(getItemChannelTopic(currentTeam.id, PAYLOAD.id))
})
