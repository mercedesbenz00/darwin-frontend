import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { deleteStorage } from '@/utils/backend'

mockApi()

let apiRemove: jest.SpyInstance
let payload: Parameters<typeof deleteStorage>[0]

beforeEach(() => {
  apiRemove = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug',
    storageSlug: 'storage_slug'
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends to backend', async () => {
  await deleteStorage(payload)
  expect(apiRemove).toHaveBeenCalledWith('teams/team_slug/storage/storage_slug')
})

it('returns response from backend', async () => {
  const response = await deleteStorage(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await deleteStorage(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.STORAGE_DELETE[401],
      status: 401
    })
  })
})
