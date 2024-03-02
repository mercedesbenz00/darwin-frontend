import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildTeamPayload,
  buildTrainingSessionPayload
} from 'test/unit/factories'

import { stopTrainingSession } from '@/store/modules/neuralModel/actions/stopTrainingSession'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ stopTrainingSession: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

let payload: StoreActionPayload<typeof stopTrainingSession>

const v7 = buildTeamPayload({ id: 5, slug: 'v7' })
const trainingSession = buildTrainingSessionPayload({
  id: 'fake-training-session',
  team_id: v7.id
})

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('neuralModel/SET_TRAINING_SESSIONS', [trainingSession])
  jest.spyOn(wind, 'stopTrainingSession').mockResolvedValue(
    buildAxiosResponse({ data: {} })
  )
  payload = { trainingSession }
})

afterEach(() => {
  (wind.stopTrainingSession as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/stopTrainingSession', payload)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/stopTrainingSession', payload)
  const expected: Parameters<typeof wind.stopTrainingSession>[0] = {
    trainingSession,
    teamId: 5
  }
  expect(wind.stopTrainingSession).toHaveBeenCalledWith(expected)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/stopTrainingSession', payload)
  expect(data).toEqual({})
})

it('removes session from store', async () => {
  expect(store.state.neuralModel.trainingSessions).toEqual([trainingSession])
  await store.dispatch('neuralModel/stopTrainingSession', payload)
  expect(store.state.neuralModel.trainingSessions).toEqual([])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'stopTrainingSession').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/stopTrainingSession', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
