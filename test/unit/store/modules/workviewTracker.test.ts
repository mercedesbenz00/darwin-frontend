import { EventEmitter } from 'events'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { getInitialState } from '@/store/modules/workviewTracker'
import { ErrorWithMessage, Socket } from '@/utils'

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

const trackingNotAvailableError: ErrorWithMessage = {
  code: 'SOCKET_ERROR',
  message: 'Work tracking not available',
  status: null,
  detail: null,
  backendMessage: null
}

beforeEach(() => {
  jest.useFakeTimers()
  store = createUnstubbedTestStore()

  channel = successChannel()
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
})

describe('workiewTracker/joinChannel', () => {
  it('works correctly', async () => {
    const response = await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })

    expect(response).toEqual(channel)
    expect(Socket.connectAndJoin).toHaveBeenCalledWith('workview:task:1')
    expect(store.state.workviewTracker.topic).toEqual('workview:task:1')
  })

  it('binds to "workview:time"', async () => {
    await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })
    expect(channel.on).toHaveBeenCalledWith('workview:time', expect.any(Function))
  })

  it('returns error on Socket.connectAndJoin error', async () => {
    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({ })

    const response =
      await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })

    expect(response).toEqual({
      error: trackingNotAvailableError
    })
  })

  it('sets error status on  Socket.connectAndJoin error', async () => {
    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({ })

    await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })

    expect(store.state.workviewTracker.status).toEqual('error')
  })

  it('dispatches automation action if pending', async () => {
    store.commit('workviewTracker/SET_PENDING_AUTOMATION_ACTION')
    jest.spyOn(channel, 'push')
    await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })
    expect(channel.push).toHaveBeenCalledWith('workview:automation_action', {})
  })

  it('dispatches no automation action if not pending', async () => {
    jest.spyOn(channel, 'push')
    await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })
    expect(channel.push).not.toHaveBeenCalledWith('workview:automation_action', {})
  })
})

describe('workiewTracker/leaveChannel', () => {
  const dispatch = async () => {
    store.commit('workviewTracker/SET_TIMER', 5)
    store.commit('workviewTracker/SET_TOPIC', 'workview:annotation:task:1')
    jest.spyOn(window, 'clearInterval')
    jest.spyOn(Socket, 'leave')

    await store.dispatch('workviewTracker/leaveChannel')
    return store
  }
  it('resets state', async () => {
    await dispatch()
    expect(store.state.workviewTracker).toEqual(getInitialState())
    expect(window.clearInterval).toHaveBeenCalledWith(5)
    expect(Socket.leave).toHaveBeenCalledWith('workview:annotation:task:1')
  })

  it('clears timer', async () => {
    await dispatch()
    expect(window.clearInterval).toHaveBeenCalledWith(5)
  })

  it('leaves channel', async () => {
    await dispatch()
    expect(Socket.leave).toHaveBeenCalledWith('workview:annotation:task:1')
  })
})

describe('workviewTracker/reportActivity', () => {
  it('reports activity by channel', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')

    jest.spyOn(Socket, 'pushPromise')

    await store.dispatch('workviewTracker/reportActivity')
    expect(Socket.pushPromise)
      .toHaveBeenCalledWith(channel, 'workview:activity', {})
  })

  it('continues timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/STOP_TIMER')
    store.commit('workviewTracker/SET_TIME', 1)

    // timer should now be active and timeInSeconds is 1

    await store.dispatch('workviewTracker/reportActivity')
    expect(store.state.workviewTracker.timerStatus).toEqual('started')
    // check setInterval timer reference has changed
    expect(store.state.workviewTracker.timer).not.toBeNull()

    // check time in seconds did not reset to 0
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
    // check timer is running
    jest.advanceTimersByTime(1000)
    expect(store.state.workviewTracker.timeInSeconds).toEqual(2)
  })

  it('sets new timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    jest.spyOn(store, 'commit')

    await store.dispatch('workviewTracker/reportActivity')

    expect(store.commit).toHaveBeenCalledWith('workviewTracker/SET_TIMER', expect.any(Number), undefined)
  })

  it('sets new interval to increment timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    jest.spyOn(store, 'commit')

    await store.dispatch('workviewTracker/reportActivity')

    jest.advanceTimersByTime(1000)
    expect(store.commit).toHaveBeenCalledWith('workviewTracker/INCREMENT_TIMER', undefined, undefined)
  })

  it('handles Socket.connectAndJoin error', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/STOP_TIMER')
    store.commit('workviewTracker/SET_TIMER', 5)
    store.commit('workviewTracker/INCREMENT_TIMER')

    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({})

    const response = await store.dispatch('workviewTracker/reportActivity')

    expect(response).toEqual({ error: trackingNotAvailableError })
  })
})

describe('workviewTracker/reportAutomationAction', () => {
  it('reports automation action by channel', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')

    jest.spyOn(Socket, 'pushPromise')

    await store.dispatch('workviewTracker/reportAutomationAction')
    expect(Socket.pushPromise)
      .toHaveBeenCalledWith(channel, 'workview:automation_action', {})
  })

  it('continues timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/STOP_TIMER')
    store.commit('workviewTracker/SET_TIME', 1)

    // timer should now be active and timeInSeconds is 1

    await store.dispatch('workviewTracker/reportAutomationAction')
    expect(store.state.workviewTracker.timerStatus).toEqual('started')
    // check setInterval timer reference has changed
    expect(store.state.workviewTracker.timer).not.toBeNull()

    // check time in seconds did not reset to 0
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
    // check timer is running
    jest.advanceTimersByTime(1000)
    expect(store.state.workviewTracker.timeInSeconds).toEqual(2)
  })

  it('sets new timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    jest.spyOn(store, 'commit')

    await store.dispatch('workviewTracker/reportAutomationAction')

    expect(store.commit).toHaveBeenCalledWith('workviewTracker/SET_TIMER', expect.any(Number), undefined)
  })

  it('sets new interval to increment timer', async () => {
    jest.useFakeTimers()

    store.commit('workviewTracker/SET_TOPIC', 'foo')
    jest.spyOn(store, 'commit')

    await store.dispatch('workviewTracker/reportAutomationAction')

    jest.advanceTimersByTime(1000)
    expect(store.commit).toHaveBeenCalledWith('workviewTracker/INCREMENT_TIMER', undefined, undefined)
  })

  it('sets pending automation action if no topic yet', async () => {
    expect(store.state.workviewTracker.pendingAutomationAction).toBe(false)
    await store.dispatch('workviewTracker/reportAutomationAction')
    expect(store.state.workviewTracker.pendingAutomationAction).toBe(true)
  })

  it('handles Socket.connectAndJoin error', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/STOP_TIMER')
    store.commit('workviewTracker/SET_TIMER', 5)
    store.commit('workviewTracker/INCREMENT_TIMER')

    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({})

    const response = await store.dispatch('workviewTracker/reportAutomationAction')

    expect(response).toEqual({ error: trackingNotAvailableError })
  })
})

describe('workviewTracker/pause', () => {
  it('reports pause by channel', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')

    jest.spyOn(Socket, 'pushPromise')

    await store.dispatch('workviewTracker/pause')
    expect(Socket.pushPromise)
      .toHaveBeenCalledWith(channel, 'workview:pause', {})
  })

  it('pauses timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/INCREMENT_TIMER')
    store.commit('workviewTracker/SET_TIMER', 5)
    store.commit('workviewTracker/START_TIMER')

    jest.spyOn(window, 'clearInterval')

    await store.dispatch('workviewTracker/pause')
    expect(store.state.workviewTracker.timer).toBeNull()
    expect(store.state.workviewTracker.timerStatus).toEqual('paused')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
  })

  it('handles Socket.connectAndJoin error', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/INCREMENT_TIMER')
    store.commit('workviewTracker/SET_TIMER', 5)

    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({})

    const response = await store.dispatch('workviewTracker/pause')

    expect(response).toEqual({ error: trackingNotAvailableError })
  })
})

describe('workviewTracker/unpause', () => {
  it('reports pause by channel', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')

    jest.spyOn(Socket, 'pushPromise')

    await store.dispatch('workviewTracker/unpause')
    expect(Socket.pushPromise)
      .toHaveBeenCalledWith(channel, 'workview:unpause', {})
  })

  it('unpauses timer', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/INCREMENT_TIMER')
    store.commit('workviewTracker/SET_TIMER', null)
    store.commit('workviewTracker/START_TIMER')

    jest.spyOn(window, 'clearInterval')

    await store.dispatch('workviewTracker/unpause')

    expect(store.state.workviewTracker.timer).toEqual(expect.any(Number))
    expect(store.state.workviewTracker.timerStatus).toEqual('started')

    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)

    jest.advanceTimersByTime(1000)
    expect(store.state.workviewTracker.timeInSeconds).toEqual(2)
  })

  it('handles Socket.connectAndJoin error', async () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    store.commit('workviewTracker/INCREMENT_TIMER')
    store.commit('workviewTracker/SET_TIMER', null)

    jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({})

    const response = await store.dispatch('workviewTracker/unpause')

    expect(response).toEqual({ error: trackingNotAvailableError })
  })
})

describe('workviewTracker/SET_TOPIC', () => {
  it('sets topic', () => {
    store.commit('workviewTracker/SET_TOPIC', 'foo')
    expect(store.state.workviewTracker.topic).toEqual('foo')
    store.commit('workviewTracker/SET_TOPIC', 'bar')
    expect(store.state.workviewTracker.topic).toEqual('bar')
  })
})

describe('workviewTracker/SET_STATUS', () => {
  it('sets status', () => {
    store.commit('workviewTracker/SET_STATUS', 'error')
    expect(store.state.workviewTracker.status).toEqual('error')
    store.commit('workviewTracker/SET_STATUS', 'joined')
    expect(store.state.workviewTracker.status).toEqual('joined')
  })
})

describe('workviewTracker/SET_TIMER', () => {
  it('sets timer', () => {
    store.commit('workviewTracker/SET_TIMER', 1)
    expect(store.state.workviewTracker.timer).toEqual(1)
    store.commit('workviewTracker/SET_TIMER', 2)
    expect(store.state.workviewTracker.timer).toEqual(2)
  })
})

describe('workviewTracker/START_TIMER', () => {
  it('sets timerStatus to "started"', () => {
    store.commit('workviewTracker/START_TIMER')
    expect(store.state.workviewTracker.timerStatus).toEqual('started')
  })

  it('clears interval reference if any', () => {
    store.commit('workviewTracker/SET_TIMER', 5)
    jest.spyOn(window, 'clearInterval')

    store.commit('workviewTracker/START_TIMER')
    expect(window.clearInterval).toHaveBeenCalledWith(5)
    expect(store.state.workviewTracker.timer).toBeNull()
  })

  it('does not reset timeInSeconds', () => {
    store.commit('workviewTracker/INCREMENT_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)

    store.commit('workviewTracker/START_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
  })
})

describe('workviewTracker/PAUSE_TIMER', () => {
  it('sets timerStatus to "paused"', () => {
    store.commit('workviewTracker/START_TIMER')
    expect(store.state.workviewTracker.timerStatus).toEqual('started')

    store.commit('workviewTracker/PAUSE_TIMER')
    expect(store.state.workviewTracker.timerStatus).toEqual('paused')
  })

  it('clears interval reference if any', () => {
    store.commit('workviewTracker/START_TIMER')
    store.commit('workviewTracker/SET_TIMER', 5)
    jest.spyOn(window, 'clearInterval')

    store.commit('workviewTracker/PAUSE_TIMER')
    expect(window.clearInterval).toHaveBeenCalledWith(5)
    expect(store.state.workviewTracker.timer).toBeNull()
  })

  it('does not reset timeInSeconds', () => {
    store.commit('workviewTracker/INCREMENT_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)

    store.commit('workviewTracker/PAUSE_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
  })
})

describe('workviewTracker/STOP_TIMER', () => {
  it('sets timerStatus to "stopped"', () => {
    store.commit('workviewTracker/START_TIMER')
    expect(store.state.workviewTracker.timerStatus).toEqual('started')

    store.commit('workviewTracker/STOP_TIMER')
    expect(store.state.workviewTracker.timerStatus).toEqual('stopped')
  })

  it('clears interval reference if any', () => {
    store.commit('workviewTracker/SET_TIMER', 5)
    jest.spyOn(window, 'clearInterval')

    store.commit('workviewTracker/STOP_TIMER')
    expect(window.clearInterval).toHaveBeenCalledWith(5)
    expect(store.state.workviewTracker.timer).toBeNull()
  })

  it('does not reset timeInSeconds', () => {
    store.commit('workviewTracker/INCREMENT_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)

    store.commit('workviewTracker/STOP_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)
  })
})

describe('workviewTracker/INCREMENT_TIMER', () => {
  it('sets timer', () => {
    expect(store.state.workviewTracker.timeInSeconds).toEqual(0)
    store.commit('workviewTracker/INCREMENT_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(1)

    store.commit('workviewTracker/INCREMENT_TIMER')
    expect(store.state.workviewTracker.timeInSeconds).toEqual(2)
  })
})

describe('workviewTracker/SET_PENDING_AUTOMATION_ACTION', () => {
  it('sets pending automation action flag', () => {
    expect(store.state.workviewTracker.pendingAutomationAction).toBe(false)
    store.commit('workviewTracker/SET_PENDING_AUTOMATION_ACTION')
    expect(store.state.workviewTracker.pendingAutomationAction).toBe(true)
  })
})

describe('on channel message', () => {
  it('sets time on channel time event', async () => {
    const channel = new EventEmitter()
    jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)

    await store.dispatch('workviewTracker/joinChannel', { topic: 'workview:task:1' })

    channel.emit('workview:time', { time: 500 })
    expect(store.state.workviewTracker.timeInSeconds).toEqual(500)
  })
})
