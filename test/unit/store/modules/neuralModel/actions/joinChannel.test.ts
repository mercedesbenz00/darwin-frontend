import { EventEmitter } from 'events'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'

import { joinChannel } from '@/store/modules/dataset/actions/joinChannel'
import { StoreActionPayload } from '@/store/types'
import { WindSocket as Socket } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

const successChannel = () => {
  const channel = {
    on: jest.fn(),
    push () {
      return this
    },
    receive (status: string, handler: Function) {
      status === 'ok' && handler()
      return this
    }
  }
  jest.spyOn(channel, 'push')
  jest.spyOn(channel, 'receive')
  return channel
}

let store: ReturnType<typeof createUnstubbedTestStore>
let channel: ReturnType<typeof successChannel>

beforeEach(() => {
  store = createUnstubbedTestStore()

  channel = successChannel()
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
})

const ACTION = 'neuralModel/joinChannel'
const payload: StoreActionPayload<typeof joinChannel> = { topic: 'models:1' }

it('works correctly', async () => {
  await store.dispatch(ACTION, payload)
  expect(Socket.connectAndJoin).toHaveBeenCalledWith('models:1')
})

it('binds to "new_trained_model"', async () => {
  await store.dispatch(ACTION, payload)
  expect(channel.on).toHaveBeenCalledWith('new_trained_model', expect.any(Function))
})

it('binds to "running_session_status_updated"', async () => {
  await store.dispatch(ACTION, payload)
  expect(channel.on).toHaveBeenCalledWith('running_session_status_updated', expect.any(Function))
})

it('binds to "training_session_status_updated"', async () => {
  await store.dispatch(ACTION, payload)
  expect(channel.on).toHaveBeenCalledWith('training_session_status_updated', expect.any(Function))
})

it('returns error on Socket.connectAndJoin error', async () => {
  jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({ })

  const response = await store.dispatch(ACTION, payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      code: 'SOCKET_ERROR',
      message: 'Models channel not available'
    })
  })
})

describe('on running_session_status_updated message', () => {
  let channel: EventEmitter

  beforeEach(() => {
    channel = new EventEmitter()
    jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
  })

  it('pushes item on running_session_status_updated event', async () => {
    const runningSession = buildRunningSessionPayload({ id: 'id1', trained_model_id: 'tmid1' })
    store.commit('neuralModel/PUSH_RUNNING_SESSION', runningSession)
    await store.dispatch(ACTION, payload)

    const updatedRunningSession = { ...runningSession, trained_model_id: 'tmid2' }
    channel.emit('running_session_status_updated', {
      from_status: 'loading',
      to_status: 'available',
      model: updatedRunningSession
    })
    expect(store.state.neuralModel.runningSessions).toEqual([updatedRunningSession])
  })
})
