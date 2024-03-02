import axios from 'axios'

import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { api, errorMessages } from '@/utils'
import { getMetrics } from '@/utils/wind'

mockApi()

let clientFactory: jest.SpyInstance
let windGet: jest.SpyInstance
let apiPost: jest.SpyInstance

beforeEach(() => {
  windGet = jest.fn(() => Promise.resolve({ data: 'get' }))

  const client = { get: windGet }
  clientFactory = jest.spyOn(axios, 'create').mockReturnValue(client as any)

  const fakeToken = { token: 'foo' }
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: fakeToken }))

  Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
})

afterEach(() => {
  windGet.mockReset()
  apiPost.mockReset()
  window.sessionStorage.clear()
  clientFactory.mockClear()
})

it('requests auth from backend', async () => {
  await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: 'view_models' })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('view_models:2', 'cached_foo')
  await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('view_models:2', 'cached_foo')
  windGet.mockRejectedValueOnce(unauthenticatedError)

  await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })

  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: 'view_models' })

  expect(clientFactory).toHaveBeenNthCalledWith(1, expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(clientFactory).toHaveBeenNthCalledWith(2, expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))

  expect(window.sessionStorage.getItem('view_models:2')).toEqual('foo')
})

it('returns error if cached auth is wrong', async () => {
  window.sessionStorage.setItem('view_models:2', 'cached_foo')
  windGet.mockRejectedValueOnce(unauthorizedError)

  const response = await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_LOAD.default,
      status: 403
    })
  })

  expect(apiPost).not.toHaveBeenCalled()

  expect(clientFactory).toHaveBeenCalledTimes(1)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(window.sessionStorage.getItem('view_models:2')).toEqual('cached_foo')
})

it('uses token to create authenticated client', async () => {
  await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(windGet).toHaveBeenCalledWith('training_sessions/fake-id/metrics')
})

it('returns response from wind', async () => {
  const response = await getMetrics({ teamId: 2, trainingSessionId: 'fake-id' })
  expect(response).toEqual(expect.objectContaining({ data: 'get' }))
})
