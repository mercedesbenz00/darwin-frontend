import { buildLoginResponsePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { login2fa } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let payload: Parameters<typeof login2fa>[0]
const loginResponse = buildLoginResponsePayload()

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: loginResponse }))
  payload = {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await login2fa(payload)
  expect(apiPost).toHaveBeenCalledWith('users/authenticate/2fa', {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  })
})

it('returns response from backend', async () => {
  const response = await login2fa(payload)
  expect(response).toEqual(expect.objectContaining({ data: loginResponse }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await login2fa(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.AUTH_CONFIRM_2FA.default,
      status: 401
    })
  })
})
