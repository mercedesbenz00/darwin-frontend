import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildParsedError,
  buildRunningSessionInstanceCountPayload,
  buildRunningSessionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import {
  loadRunningSessionInstanceCounts
} from '@/store/modules/neuralModel/actions/loadRunningSessionInstanceCounts'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadRunningSessionInstanceCounts: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const runningSession = buildRunningSessionPayload({ id: 'count-test-session' })
const counts = buildRunningSessionInstanceCountPayload({ running_session_id: 'count-test-session' })

const payload: StoreActionPayload<typeof loadRunningSessionInstanceCounts> = {
  granularity: 'hour',
  runningSession
}

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadRunningSessionInstanceCounts')
    .mockResolvedValue({ data: [counts] })
})

afterEach(() => {
  (wind.loadRunningSessionInstanceCounts as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(
    store.dispatch('neuralModel/loadRunningSessionInstanceCounts', payload)
  ).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/loadRunningSessionInstanceCounts', payload)
  expect(wind.loadRunningSessionInstanceCounts).toHaveBeenCalledWith({
    granularity: 'hour',
    runningSessionId: 'count-test-session',
    teamId: 7
  })
})

it('passes optional "from" param to request', async () => {
  await store.dispatch('neuralModel/loadRunningSessionInstanceCounts', {
    ...payload,
    from: '2020-01-02T00:01:00'
  })
  expect(wind.loadRunningSessionInstanceCounts).toHaveBeenCalledWith({
    from: '2020-01-02T00:01:00',
    granularity: 'hour',
    runningSessionId: 'count-test-session',
    teamId: 7
  })
})

it('returns raw data', async () => {
  const { data } =
    await store.dispatch('neuralModel/loadRunningSessionInstanceCounts', payload)
  expect(data).toEqual([counts])
})

it('pushes response to state', async () => {
  await store.dispatch('neuralModel/loadRunningSessionInstanceCounts', payload)
  expect(store.state.neuralModel.runningSessionInstanceCounts).toEqual([counts])
})

it('responds with parsed error on failure', async () => {
  jest
    .spyOn(wind, 'loadRunningSessionInstanceCounts')
    .mockResolvedValue(buildParsedError({ message: 'foo' }))

  const { error } =
    await store.dispatch('neuralModel/loadRunningSessionInstanceCounts', payload)

  expect(error.message).toEqual('foo')
})
