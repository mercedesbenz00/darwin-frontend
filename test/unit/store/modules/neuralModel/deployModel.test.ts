import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildRunningSessionPayload,
  buildTeamPayload,
  buildTrainedModelPayload
} from 'test/unit/factories'

import { deployModel } from '@/store/modules/neuralModel/actions/deployModel'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ createRunningSession: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const trainedModel = buildTrainedModelPayload({ id: 'trained-model' })
const runningSession = buildRunningSessionPayload({
  id: 'fake-running-session', trained_model_id: 'trained-model'
})

let payload: StoreActionPayload<typeof deployModel>

const v7 = buildTeamPayload({ id: 7, slug: 'v7' })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'createRunningSession').mockResolvedValue({ data: runningSession })
  payload = {
    autoStart: false,
    autoStop: false,
    isPublic: true,
    device: ModelDevice.GPU,
    trainedModel,
    minimumInstances: 1,
    maximumInstances: 2,
    name: 'Test'
  }
})

afterEach(() => {
  (wind.createRunningSession as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/deployModel', payload)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/deployModel', payload)
  const expected: Parameters<typeof wind.createRunningSession>[0] = {
    accessLevel: 'public',
    autoStart: false,
    autoStop: false,
    device: ModelDevice.GPU,
    expand: ['meta.classes', 'meta.num_instances_available', 'meta.num_instances_starting'],
    min: 1,
    max: 2,
    name: 'Test',
    teamId: 7,
    trainedModelId: 'trained-model'
  }
  expect(wind.createRunningSession).toHaveBeenCalledWith(expected)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/deployModel', payload)
  expect(data).toEqual(runningSession)
})

it('pushes running session to store on success', async () => {
  jest.spyOn(store, 'commit')
  expect(store.state.neuralModel.runningSessions).toEqual([])
  await store.dispatch('neuralModel/deployModel', payload)
  expect(store.state.neuralModel.runningSessions).toEqual([runningSession])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'createRunningSession').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/deployModel', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
