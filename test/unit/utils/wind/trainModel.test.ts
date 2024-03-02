import axios from 'axios'

import { buildTrainingClass, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windPaymentRequiredError,
  windServicesDownError,
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { ModelDevice } from '@/store/modules/neuralModel/types'
import { api, errorMessages } from '@/utils'
import { WindAuthAction } from '@/utils/backend'
import { trainModel } from '@/utils/wind'

mockApi()

let clientFactory: jest.SpyInstance
let windPost: jest.SpyInstance
let apiPost: jest.SpyInstance

beforeEach(() => {
  windPost = jest.fn(() => Promise.resolve({ data: 'post' }))

  const client = { post: windPost }
  clientFactory = jest.spyOn(axios, 'create').mockReturnValue(client as any)

  const fakeToken = { token: 'foo' }
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: fakeToken }))

  Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
})

afterEach(() => {
  windPost.mockReset()
  apiPost.mockReset()
  window.sessionStorage.clear()
  clientFactory.mockClear()
})

const params: Parameters<typeof trainModel>[0] = {
  classes: [buildTrainingClass({ darwin_id: 1, name: 'Box', type: 'bounding_box', id: undefined })],
  datasetId: 1,
  datasetSlug: 'sfh',
  datasetVersion: 1,
  device: ModelDevice.GPU,
  modelTemplateId: 'template-id',
  name: 'My Model',
  teamId: 2,
  teamSlug: 'v7'
}
it('requests auth from backend', async () => {
  await trainModel(params)
  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: WindAuthAction.TrainModels })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  await trainModel(params)
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthenticatedError)

  await trainModel(params)

  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: WindAuthAction.TrainModels })

  expect(clientFactory).toHaveBeenNthCalledWith(1, expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(clientFactory).toHaveBeenNthCalledWith(2, expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))

  expect(window.sessionStorage.getItem('train_models:2')).toEqual('foo')
})

it('returns error if cached auth is wrong', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthorizedError)

  const response = await trainModel(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_TRAIN.default,
      status: 403
    })
  })

  expect(apiPost).not.toHaveBeenCalled()

  expect(clientFactory).toHaveBeenCalledTimes(1)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(window.sessionStorage.getItem('train_models:2')).toEqual('cached_foo')
})

it('uses token to create authenticated client', async () => {
  await trainModel(params)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await trainModel(params)
  expect(windPost).toHaveBeenCalledWith('model_templates/template-id/training_sessions', {
    classes: [{
      darwin_id: 1,
      name: 'Box',
      subs: [],
      type: 'bounding_box'
    }],
    dataset_id: 1,
    dataset_identifier: 'v7/sfh',
    dataset_version: 1,
    device: ModelDevice.GPU,
    name: 'My Model',
    team_id: 2
  })
})

it('returns response from wind', async () => {
  const response = await trainModel(params)
  expect(response).toEqual(expect.objectContaining({ data: 'post' }))
})

it('parses a 402 error', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  windPost.mockRejectedValueOnce(windPaymentRequiredError)

  const response = await trainModel(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_TRAIN[402],
      status: 402
    })
  })
})

it('parses a 503 error', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  windPost.mockRejectedValueOnce(windServicesDownError)

  const response = await trainModel(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_TRAIN[503],
      status: 503
    })
  })
})
