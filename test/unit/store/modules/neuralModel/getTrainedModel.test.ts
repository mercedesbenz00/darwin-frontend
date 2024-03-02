import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildModelPayload } from 'test/unit/factories'

import { getTrainedModel } from '@/store/modules/neuralModel/actions/getTrainedModel'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ getTrainedModel: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>
const someModel = buildModelPayload({ id: 'some-model' })
const payload: StoreActionPayload<typeof getTrainedModel> = { modelId: 'some-model', teamId: 5 }

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(wind, 'getTrainedModel').mockResolvedValue(
    buildAxiosResponse({ data: someModel })
  )
})

it('sends request', async () => {
  await store.dispatch('neuralModel/getTrainedModel', payload)
  expect(wind.getTrainedModel).toHaveBeenCalledWith(payload)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/getTrainedModel', payload)
  expect(data).toEqual(someModel)
})

it('pushes deserialized data to store', async () => {
  await store.dispatch('neuralModel/getTrainedModel', payload)
  expect(store.state.neuralModel.trainedModels).toEqual([someModel])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'getTrainedModel').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/getTrainedModel', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
