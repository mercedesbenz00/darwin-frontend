import { buildAxiosResponse } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateStorage } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance
let payload: Parameters<typeof updateStorage>[0]

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug',
    storage: buildStoragePayload()
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends to backend', async () => {
  await updateStorage(payload)
  expect(apiPut).toHaveBeenCalledWith('teams/team_slug/storage/slug_1', payload.storage)
})

it('returns response from backend', async () => {
  const response = await updateStorage(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateStorage(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.STORAGE_UPDATE[401],
      status: 401
    })
  })
})
