import { buildAxiosResponse } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createStorage } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let payload: Parameters<typeof createStorage>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug',
    storage: buildStoragePayload()
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends to backend', async () => {
  await createStorage(payload)
  expect(apiPost).toHaveBeenCalledWith('teams/team_slug/storage', payload.storage)
})

it('returns response from backend', async () => {
  const response = await createStorage(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createStorage(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.STORAGE_CREATE.default
    })
  })
})
