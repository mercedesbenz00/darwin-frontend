import axios from 'axios'

import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { ModelDevice } from '@/store/modules/neuralModel/types'
import { api, errorMessages } from '@/utils'
import { WindAuthAction } from '@/utils/backend'
import { createRunningSession } from '@/utils/wind'

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

const params: Parameters<typeof createRunningSession>[0] = {
  accessLevel: 'public',
  autoStart: false,
  autoStop: false,
  device: ModelDevice.GPU,
  trainedModelId: 'trained-model-1',
  max: 5,
  min: 1,
  name: 'A session',
  teamId: 5
}

it('requests auth from backend', async () => {
  await createRunningSession(params)
  expect(apiPost).toHaveBeenCalledWith('teams/5/wind_auth', { action: WindAuthAction.DeployModel })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('deploy_model:5', 'cached_view_foo')
  await createRunningSession(params)
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_view_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('deploy_model:5', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthenticatedError)

  await createRunningSession(params)

  expect(apiPost).toHaveBeenCalledWith('teams/5/wind_auth', { action: WindAuthAction.DeployModel })

  expect(clientFactory).toHaveBeenNthCalledWith(1, expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(clientFactory).toHaveBeenNthCalledWith(2, expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))

  expect(window.sessionStorage.getItem('deploy_model:5')).toEqual('foo')
})

it('returns error if cached auth is wrong', async () => {
  window.sessionStorage.setItem('deploy_model:5', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthorizedError)

  const response = await createRunningSession(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_DEPLOY.default, status: 403
    })
  })

  expect(apiPost).not.toHaveBeenCalled()

  expect(clientFactory).toHaveBeenCalledTimes(1)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(window.sessionStorage.getItem('deploy_model:5')).toEqual('cached_foo')
})

it('uses token to create authenticated client', async () => {
  await createRunningSession(params)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await createRunningSession(params)
  expect(windPost).toHaveBeenCalledWith('trained_models/trained-model-1/running_sessions', {
    access_level: 'public',
    auto_start: false,
    auto_stop: false,
    device: ModelDevice.GPU,
    max: 5,
    min: 1,
    name: 'A session'
  }, { params: {} })
})

it('passes any expansion params to wind', async () => {
  params.expand = ['meta.classes']
  await createRunningSession(params)
  expect(windPost).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    { params: { expand: ['meta.classes'] } }
  )
})

it('returns response from wind', async () => {
  const response = await createRunningSession(params)

  expect(response).toEqual(expect.objectContaining({ data: 'post' }))
})
