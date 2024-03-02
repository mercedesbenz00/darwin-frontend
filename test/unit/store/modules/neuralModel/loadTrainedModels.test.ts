import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload, buildTrainedModelPayload } from 'test/unit/factories'

import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadTrainedModels: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>
const trainedModel = buildTrainedModelPayload({})

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadTrainedModels').mockResolvedValue({ data: [trainedModel] })
})

afterEach(() => {
  (wind.loadTrainedModels as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/loadTrainedModels')).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/loadTrainedModels')
  expect(wind.loadTrainedModels).toHaveBeenCalledWith({ teamId: 7 })
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/loadTrainedModels')
  expect(data).toEqual([trainedModel])
})

it('pushes response to state', async () => {
  await store.dispatch('neuralModel/loadTrainedModels')
  expect(store.state.neuralModel.trainedModels).toEqual([trainedModel])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'loadTrainedModels').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/loadTrainedModels')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
