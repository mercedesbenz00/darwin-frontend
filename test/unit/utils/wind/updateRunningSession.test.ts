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
import { updateRunningSession } from '@/utils/wind'

mockApi()

let clientFactory: jest.SpyInstance
let windPut: jest.SpyInstance
let apiPost: jest.SpyInstance

beforeEach(() => {
  windPut = jest.fn(() => Promise.resolve({ data: 'post' }))

  const client = { put: windPut }
  clientFactory = jest.spyOn(axios, 'create').mockReturnValue(client as any)

  const fakeToken = { token: 'foo' }
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: fakeToken }))

  Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
})

afterEach(() => {
  windPut.mockReset()
  apiPost.mockReset()
  window.sessionStorage.clear()
  clientFactory.mockClear()
})

const params: Parameters<typeof updateRunningSession>[0] = {
  autoStop: false,
  max: 5,
  min: 1,
  runningSessionId: 'fake-id',
  teamId: 5
}

it('requests auth from backend', async () => {
  await updateRunningSession(params)
  expect(apiPost).toHaveBeenCalledWith('teams/5/wind_auth', { action: WindAuthAction.DeployModel })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('deploy_model:5', 'cached_view_foo')
  await updateRunningSession(params)
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_view_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('deploy_model:5', 'cached_foo')
  windPut.mockRejectedValueOnce(unauthenticatedError)

  await updateRunningSession(params)

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
  windPut.mockRejectedValueOnce(unauthorizedError)

  const response = await updateRunningSession(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_UPDATE.default, status: 403
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
  await updateRunningSession(params)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await updateRunningSession(params)
  expect(windPut).toHaveBeenCalledWith(
    'running_sessions/fake-id',
    { auto_stop: false, max: 5, min: 1 },
    { params: {} }
  )
})

it('passes any expansion params to wind', async () => {
  params.expand = ['meta.classes']
  await updateRunningSession(params)
  expect(windPut).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    { params: { expand: ['meta.classes'] } }
  )
})

it('returns response from wind', async () => {
  const response = await updateRunningSession(params)

  expect(response).toEqual(expect.objectContaining({ data: 'post' }))
})
