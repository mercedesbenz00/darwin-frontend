import { EventEmitter } from 'events'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildTeamPayload,
  buildV2DatasetItemPayload,
  buildV2WorkflowItemPayload,
  buildV2WorkflowItemStatePayload
} from 'test/unit/factories'

import { StoreActionPayload, TeamPayload } from '@/store/types'
import { Channel, Socket } from '@/utils'

import { joinV2WorkflowsChannel } from './joinV2WorkflowsChannel'

const localVue = createLocalVue()
localVue.use(Vuex)

const successChannel = (): Channel => {
  const channel = {
    on: jest.fn(),
    push (): typeof this {
      return this
    },
    receive (status: string, handler: Function): typeof this {
      status === 'ok' && handler()
      return this
    }
  }
  jest.spyOn(channel, 'push')
  jest.spyOn(channel, 'receive')
  return channel as unknown as Channel
}

let store: ReturnType<typeof createUnstubbedTestStore>
let channel: ReturnType<typeof successChannel>
const item = buildV2WorkflowItemPayload({ id: 'active-item-id' })
const datasetItem = buildDatasetItemPayload({ workflow_item: item })
let currentTeam: TeamPayload

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
  channel = successChannel()
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel })

  currentTeam = buildTeamPayload({ id: 1 })
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
})

const ACTION = 'workview/joinV2WorkflowsChannel'
const PAYLOAD: StoreActionPayload<typeof joinV2WorkflowsChannel> = buildV2DatasetItemPayload()

it('connects via compited topic', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(Socket.connectAndJoin).toHaveBeenCalledWith('workflow_item:1:1')
})

it('binds to "workflow_item:state"', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(channel.on).toHaveBeenCalledWith('workflow_item:state', expect.any(Function))
})

it('returns error on Socket.connectAndJoin error', async () => {
  jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({ })

  const response = await store.dispatch(ACTION, PAYLOAD)

  expect(response).toEqual({
    error: expect.objectContaining({
      code: 'SOCKET_ERROR',
      message: 'Workflow 2.0 channel not available'
    })
  })
})

describe('workflow_item:state', () => {
  let channel: Channel & EventEmitter

  beforeEach(() => {
    channel = new EventEmitter() as unknown as Channel & EventEmitter
    jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel })
  })

  it('pushes item on items_updated event', async () => {
    await store.dispatch(ACTION, PAYLOAD)

    const itemState = buildV2WorkflowItemStatePayload()

    channel.emit('workflow_item:state', { state: itemState })
    expect(store.state.workview.v2WorkflowItemState).toEqual(itemState)
  })
})
