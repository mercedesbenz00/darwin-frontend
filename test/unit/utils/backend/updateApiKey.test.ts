import { buildApiKeyPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateApiKey } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateApiKey>[0]
const key = buildApiKeyPayload({ id: 3, name: 'Random' })

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: key }))
  payload = {
    apiKeyId: 5,
    permissions: [['run_inference', 'all']]
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateApiKey(payload)
  expect(apiPut).toHaveBeenCalledWith('api_keys/5', {
    permissions: [['run_inference', 'all']]
  })
})

it('returns response from backend', async () => {
  const response = await updateApiKey(payload)
  expect(response).toEqual(expect.objectContaining({ data: key }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateApiKey(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.API_KEY_UPDATE[401],
      status: 401
    })
  })
})
