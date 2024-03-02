import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadTrainingSessions: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const trainingSession = buildTrainingSessionPayload({})
const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadTrainingSessions').mockResolvedValue({ data: [trainingSession] })
})

afterEach(() => {
  (wind.loadTrainingSessions as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/loadTrainingSessions')).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/loadTrainingSessions')
  expect(wind.loadTrainingSessions).toHaveBeenCalledWith({ teamId: 7 })
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/loadTrainingSessions')
  expect(data).toEqual([trainingSession])
})

it('pushes response to state', async () => {
  await store.dispatch('neuralModel/loadTrainingSessions')
  expect(store.state.neuralModel.trainingSessions).toEqual([trainingSession])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'loadTrainingSessions').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/loadTrainingSessions')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
