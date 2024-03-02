import axios from 'axios'

import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { api, errorMessages } from '@/utils'
import { runInference } from '@/utils/wind'

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

const params: Parameters<typeof runInference>[0] = {
  image: { url: 'foo' },
  data: { bbox: { x: 1, y: 1, w: 100, h: 100 } },
  runningSessionId: 'fake-id',
  teamId: 2
}

it('requests auth from backend', async () => {
  await runInference(params)
  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: 'run_inference' })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('run_inference:2', 'cached_foo')
  await runInference(params)
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('run_inference:2', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthenticatedError)

  await runInference(params)

  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: 'run_inference' })

  expect(clientFactory).toHaveBeenNthCalledWith(1, expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(clientFactory).toHaveBeenNthCalledWith(2, expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))

  expect(window.sessionStorage.getItem('run_inference:2')).toEqual('foo')
})

it('returns error if cached auth is wrong', async () => {
  window.sessionStorage.setItem('run_inference:2', 'cached_foo')
  windPost.mockRejectedValueOnce(unauthorizedError)

  const response = await runInference(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_INFER[403],
      status: 403
    })
  })

  expect(apiPost).not.toHaveBeenCalled()

  expect(clientFactory).toHaveBeenCalledTimes(1)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))

  expect(window.sessionStorage.getItem('run_inference:2')).toEqual('cached_foo')
})

it('uses token to create authenticated client', async () => {
  await runInference(params)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await runInference(params)
  expect(windPost).toHaveBeenCalledWith('running_sessions/fake-id/infer', {
    image: { url: 'foo' },
    data: { bbox: { x: 1, y: 1, w: 100, h: 100 } }
  })
})

it('returns response from wind', async () => {
  const response = await runInference(params)
  expect(response).toEqual(expect.objectContaining({ data: 'post' }))
})
