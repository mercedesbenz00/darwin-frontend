import { buildLoginResponsePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { setup2fa } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let emailPayload: Parameters<typeof setup2fa>[0]
let accesTokenPayload: Parameters<typeof setup2fa>[0]
const loginResponse = buildLoginResponsePayload()

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: loginResponse }))
  emailPayload = {
    email: 'test@v7labs.com',
    password: 'Password1'
  }
  accesTokenPayload = {
    access_token: 'token'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend with email', async () => {
  await setup2fa(emailPayload)
  expect(apiPost).toHaveBeenCalledWith('users/setup_2fa', {
    email: 'test@v7labs.com',
    password: 'Password1'
  })
})

it('sends request to backend with access token', async () => {
  await setup2fa(accesTokenPayload)
  expect(apiPost).toHaveBeenCalledWith('users/setup_2fa', {
    access_token: 'token'
  })
})

it('returns response from backend', async () => {
  const response = await setup2fa(emailPayload)
  expect(response).toEqual(expect.objectContaining({ data: loginResponse }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await setup2fa(emailPayload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.AUTH_SETUP_2FA.default,
      status: 401
    })
  })
})
