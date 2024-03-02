import { buildLogin2faResponsePayload, buildLoginResponsePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { login } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof login>[0]
const loginResponsePayload = buildLoginResponsePayload()
const login2faResponsePayload = buildLogin2faResponsePayload()

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: loginResponsePayload }))
  payload = {
    email: 'test@v7labs.com',
    password: 'Password1'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend with email', async () => {
  await login(payload)
  expect(apiPost).toHaveBeenCalledWith('users/authenticate', {
    email: 'test@v7labs.com',
    password: 'Password1'
  })
})

it('returns response from backend', async () => {
  const response = await login(payload)
  expect(response).toEqual(expect.objectContaining({ data: loginResponsePayload }))
})

it('returns 2fa response from backend', async () => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: login2faResponsePayload }))
  const response = await login(payload)
  expect(response).toEqual(expect.objectContaining({ data: login2faResponsePayload }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await login(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.AUTH_LOGIN[401],
      status: 401
    })
  })
})
