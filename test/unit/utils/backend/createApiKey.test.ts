import { buildApiKeyPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createApiKey } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createApiKey>[0]
const key = buildApiKeyPayload({ id: 3, name: 'Random' })

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: key }))
  payload = {
    name: 'Test',
    permissions: [['run_inference', 'all']],
    teamId: 7
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createApiKey(payload)
  expect(apiPost).toHaveBeenCalledWith('teams/7/api_keys', {
    name: 'Test',
    permissions: [['run_inference', 'all']]
  })
})

it('returns response from backend', async () => {
  const response = await createApiKey(payload)
  expect(response).toEqual(expect.objectContaining({ data: key }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createApiKey(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.API_KEY_CREATE[401],
      status: 401
    })
  })
})
