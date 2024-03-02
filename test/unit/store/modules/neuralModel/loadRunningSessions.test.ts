import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildRunningSessionPayload, buildTeamPayload } from 'test/unit/factories'

import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadRunningSessions: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ id: 7 })
const runningSession = buildRunningSessionPayload({})

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadRunningSessions').mockResolvedValue({ data: [runningSession] })
})

afterEach(() => {
  (wind.loadRunningSessions as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/loadRunningSessions')).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/loadRunningSessions')
  const expected: Parameters<typeof wind.loadRunningSessions>[0] = {
    expand: ['meta.classes', 'meta.num_instances_available', 'meta.num_instances_starting'],
    teamId: 7
  }
  expect(wind.loadRunningSessions).toHaveBeenCalledWith(expected)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/loadRunningSessions')
  expect(data).toEqual([runningSession])
})

it('pushes response to state', async () => {
  await store.dispatch('neuralModel/loadRunningSessions')
  expect(store.state.neuralModel.runningSessions).toEqual([runningSession])
})

it('returns parsed error on failure', async () => {
  jest.spyOn(wind, 'loadRunningSessions').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('neuralModel/loadRunningSessions')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
