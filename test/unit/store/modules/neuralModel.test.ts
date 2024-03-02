import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildModelPayload,
  buildTrainedModelPayload,
  buildTrainingSessionPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { deserialize } from '@/store/modules/neuralModel/serializer'
import { getInitialState } from '@/store/modules/neuralModel/state'
import { validateNewModel } from '@/store/modules/neuralModel/utils'
import { api, errorsByCode } from '@/utils'
import { ModelType } from '@/utils/wind/types'

jest.mock('@/utils/wind', () => ({
  createRunningSession: jest.fn(),
  getModel: jest.fn(),
  loadRunningSessions: jest.fn(),
  runInference: jest.fn(),
  trainModel: jest.fn(),
  updateRunningSession: jest.fn()
}))

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const modelPayload = buildModelPayload({
  id: 'c595696d-65eb-494c-bcfe-d5fb543c1874',
  dataset_id: 1,
  name: 'My Model',
  type: ModelType.InstanceSegmentation,
  tier: 'standard'
})

const model = deserialize(modelPayload)

const unauthorizedError = { response: { status: 401 } }

const tiers = [{ name: 'Evaluation', id: 'evaluation', description: 'Foo' }]
const types = [{ name: 'Classification', id: 'classification', description: 'Foo' }]

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('neuralModel/getTiers', () => {
  it('sends request', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: tiers }))

    await store.dispatch('neuralModel/getTiers')
    expect(api.get).toHaveBeenCalledWith('/neural_models/tiers')
  })

  it('returns raw data', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: tiers }))

    const { data } = await store.dispatch('neuralModel/getTiers')
    expect(data).toEqual(tiers)
  })

  it('pushes raw data to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: tiers }))

    await store.dispatch('neuralModel/getTiers', model)
    expect(store.state.neuralModel.tiers).toEqual(tiers)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('neuralModel/getTiers')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.NEURAL_MODEL_DATA_NOT_AUTHORIZED
      })
    )
  })
})

describe('neuralModel/validateNewModel', () => {
  describe('classification with less than 2 classes', () => {
    it('provides a validation error under _classes_', () => {
      const state = {
        ...getInitialState(),
        newModelType: ModelType.Classification,
        newModelSelectedClassIds: [1]
      }

      const errors = validateNewModel(state)

      expect(errors.classes).toEqual('You must select at least two classes to train on.')
    })
  })
})

describe('neuralModel/getTypes', () => {
  it('sends request', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: types }))

    await store.dispatch('neuralModel/getTypes')
    expect(api.get).toHaveBeenCalledWith('/neural_models/types')
  })

  it('returns raw data', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: types }))

    const { data } = await store.dispatch('neuralModel/getTypes')
    expect(data).toEqual(types)
  })

  it('pushes raw data to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: types }))

    await store.dispatch('neuralModel/getTypes', model)
    expect(store.state.neuralModel.types).toEqual(types)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('neuralModel/getTypes')
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.NEURAL_MODEL_DATA_NOT_AUTHORIZED
      })
    )
  })
})

describe('neuralModel/DELETE_TRAINING_SESSION', () => {
  const session1 = buildTrainingSessionPayload({ id: 'foo' })
  const session2 = buildTrainingSessionPayload({ id: 'bar' })

  it('deletes session from store', () => {
    store.commit('neuralModel/PUSH_TRAINING_SESSION', session1)
    expect(store.state.neuralModel.trainingSessions).toEqual([session1])
    store.commit('neuralModel/DELETE_TRAINING_SESSION', session1)
    expect(store.state.neuralModel.trainingSessions).toEqual([])
  })

  it('does nothing if session does not exist in store', () => {
    expect(store.state.neuralModel.trainingSessions).toEqual([])
    store.commit('neuralModel/DELETE_TRAINING_SESSION', session2)
    expect(store.state.neuralModel.trainingSessions).toEqual([])
  })
})

describe('neuralModel/PUSH_TRAINED_MODEL', () => {
  const model1 = buildTrainedModelPayload({ id: 'foo' })
  const model2 = buildTrainedModelPayload({ id: 'bar' })

  it('pushes model to store', () => {
    expect(store.state.neuralModel.trainedModels).toEqual([])
    store.commit('neuralModel/PUSH_TRAINED_MODEL', model1)
    expect(store.state.neuralModel.trainedModels).toEqual([model1])
  })

  it('replaces existing model in store', () => {
    store.commit('neuralModel/PUSH_TRAINED_MODEL', model1)
    expect(store.state.neuralModel.trainedModels).toEqual([model1])
    const changed = { ...model1, name: 'New name' }
    store.commit('neuralModel/PUSH_TRAINED_MODEL', changed)
    expect(store.state.neuralModel.trainedModels).toEqual([changed])
    store.commit('neuralModel/PUSH_TRAINED_MODEL', model2)
    expect(store.state.neuralModel.trainedModels).toEqual([changed, model2])
  })
})

describe('neuralModel/PUSH_TRAINING_SESSION', () => {
  const session1 = buildTrainingSessionPayload({ id: 'foo' })
  const session2 = buildTrainingSessionPayload({ id: 'bar' })

  it('pushes session to store', () => {
    expect(store.state.neuralModel.trainingSessions).toEqual([])
    store.commit('neuralModel/PUSH_TRAINING_SESSION', session1)
    expect(store.state.neuralModel.trainingSessions).toEqual([session1])
  })

  it('replaces existing session in store', () => {
    store.commit('neuralModel/PUSH_TRAINING_SESSION', session1)
    expect(store.state.neuralModel.trainingSessions).toEqual([session1])
    const changed = { ...session1, device: 'gpu' }
    store.commit('neuralModel/PUSH_TRAINING_SESSION', changed)
    expect(store.state.neuralModel.trainingSessions).toEqual([changed])
    store.commit('neuralModel/PUSH_TRAINING_SESSION', session2)
    expect(store.state.neuralModel.trainingSessions).toEqual([changed, session2])
  })
})

describe('neuralModel/SET_TIERS', () => {
  it('sets raw tiers on store', () => {
    store.commit('neuralModel/SET_TIERS', tiers)
    expect(store.state.neuralModel.tiers).toEqual(tiers)
  })
})

describe('neuralModel/SET_TYPES', () => {
  it('sets raw tiers on store', () => {
    store.commit('neuralModel/SET_TYPES', types)
    expect(store.state.neuralModel.types).toEqual(types)
  })
})
