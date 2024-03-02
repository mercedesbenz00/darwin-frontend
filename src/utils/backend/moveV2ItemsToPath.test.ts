import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { moveV2ItemsToPath } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance
let payload: Parameters<typeof moveV2ItemsToPath>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
  payload = {
    teamSlug: 'v7',
    filters: { item_ids: ['1', '6', '9'] },
    path: '/'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await moveV2ItemsToPath(payload)
  expect(apiPost).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/path`, {
    filters: { item_ids: ['1', '6', '9'] },
    path: '/'
  })
})

it('returns response from backend', async () => {
  const response = await moveV2ItemsToPath(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await moveV2ItemsToPath(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_MOVE_ITEMS_TO_PATH.default,
      status: 401
    })
  })
})
