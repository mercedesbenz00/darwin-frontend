import axios from 'axios'

import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { api, errorMessages } from '@/utils'
import { WindAuthAction } from '@/utils/backend'
import { loadTrainingSessions } from '@/utils/wind'

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
  await loadTrainingSessions({ teamId: 2 })
  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: WindAuthAction.ViewModels })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('view_models:2', 'cached_foo')
  await loadTrainingSessions({ teamId: 2 })
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))
})

it('makes an unauthenticated request if no team id', async () => {
  await loadTrainingSessions({ })
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.not.objectContaining({
    headers: expect.anything()
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('view_models:2', 'cached_foo')
  windGet.mockRejectedValueOnce(unauthenticatedError)

  await loadTrainingSessions({ teamId: 2 })

  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: WindAuthAction.ViewModels })

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

  const response = await loadTrainingSessions({ teamId: 2 })
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_DATA.default,
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
  await loadTrainingSessions({ teamId: 2 })
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await loadTrainingSessions({ teamId: 2 })
  expect(windGet).toHaveBeenCalledWith('training_sessions', { params: { } })
})

it('returns response from wind', async () => {
  const response = await loadTrainingSessions({ teamId: 2 })
  expect(response).toEqual(expect.objectContaining({ data: 'get' }))
})
