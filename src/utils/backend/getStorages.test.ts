import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { getStorages } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance
let payload: Parameters<typeof getStorages>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [] }))
  payload = {
    teamSlug: 'team_slug'
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('sends to backend', async () => {
  await getStorages(payload)
  expect(apiGet).toHaveBeenCalledWith('teams/team_slug/storage')
})

it('returns response from backend', async () => {
  const response = await getStorages(payload)
  expect(response).toEqual(expect.objectContaining({ data: [] }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await getStorages(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.STORAGE_GET.default
    })
  })
})
