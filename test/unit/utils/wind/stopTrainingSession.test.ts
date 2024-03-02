import axios from 'axios'

import {
  buildAxiosResponse,
  buildTrainingSessionPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import {
  windUnauthenticatedError as unauthenticatedError,
  windUnauthorizedError as unauthorizedError
} from 'test/unit/responseStubs'
import { Mock } from 'test/unit/utils/storageMocks'

import { api, errorMessages } from '@/utils'
import { WindAuthAction } from '@/utils/backend'
import { stopTrainingSession } from '@/utils/wind'

mockApi()

let clientFactory: jest.SpyInstance
let windDelete: jest.SpyInstance
let apiPost: jest.SpyInstance

const trainingSession = buildTrainingSessionPayload({ team_id: 2 })

beforeEach(() => {
  windDelete = jest.fn(() => Promise.resolve({}))

  const client = { delete: windDelete }
  clientFactory = jest.spyOn(axios, 'create').mockReturnValue(client as any)

  const fakeToken = { token: 'foo' }
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: fakeToken }))

  Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
})

afterEach(() => {
  windDelete.mockReset()
  apiPost.mockReset()
  window.sessionStorage.clear()
  clientFactory.mockClear()
})

const params: Parameters<typeof stopTrainingSession>[0] = {
  trainingSession,
  teamId: 2
}
it('requests auth from backend', async () => {
  await stopTrainingSession(params)
  expect(apiPost).toHaveBeenCalledWith('teams/2/wind_auth', { action: WindAuthAction.TrainModels })
})

it('takes auth from cache if available', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  await stopTrainingSession(params)
  expect(apiPost).not.toHaveBeenCalled()
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey cached_foo' }
  }))
})

it('reauths if cached auth has expired', async () => {
  window.sessionStorage.setItem('train_models:2', 'cached_foo')
  windDelete.mockRejectedValueOnce(unauthenticatedError)

  await stopTrainingSession(params)

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
  windDelete.mockRejectedValueOnce(unauthorizedError)

  const response = await stopTrainingSession(params)
  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.NEURAL_MODEL_STOP_TRAINING_SESSION.default, status: 403
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
  await stopTrainingSession(params)
  expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: 'ApiKey foo' }
  }))
})

it('sends authenticated request to wind', async () => {
  await stopTrainingSession(params)
  expect(windDelete).toHaveBeenCalledWith(`training_sessions/${trainingSession.id}`)
})

it('returns response from wind', async () => {
  const response = await stopTrainingSession(params)
  expect(response).toEqual(expect.objectContaining({}))
})
