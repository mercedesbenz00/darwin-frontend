import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { confirm2fa } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let emailPayload: Parameters<typeof confirm2fa>[0]
let accessTokenPayload: Parameters<typeof confirm2fa>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: [] }))
  emailPayload = {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  }
  accessTokenPayload = {
    access_token: 'token',
    token: '123456'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend with email', async () => {
  await confirm2fa(emailPayload)
  expect(apiPost).toHaveBeenCalledWith('users/confirm_2fa', {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  })
})

it('sends request to backend with access_token', async () => {
  await confirm2fa(accessTokenPayload)
  expect(apiPost).toHaveBeenCalledWith('users/confirm_2fa', {
    access_token: 'token',
    token: '123456'
  })
})

it('returns response from backend', async () => {
  const response = await confirm2fa(emailPayload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await confirm2fa(emailPayload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.AUTH_CONFIRM_2FA.default,
      status: 401
    })
  })
})
