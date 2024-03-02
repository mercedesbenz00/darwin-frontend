import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { addPriorityToV2Items } from '@/utils/backend'

mockApi()

let backend: jest.SpyInstance
let payload: Parameters<typeof addPriorityToV2Items>[0]

beforeEach(() => {
  backend = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: payload }))
  payload = {
    teamSlug: 'v7',
    filters: { item_ids: ['1', '6', '9'] },
    priority: 2
  }
})

afterEach(() => {
  backend.mockReset()
})

it('sends request to backend', async () => {
  await addPriorityToV2Items(payload)
  expect(backend).toHaveBeenCalledWith(`v2/teams/${payload.teamSlug}/items/priority`, {
    filters: { item_ids: ['1', '6', '9'] },
    priority: 2
  })
})

it('returns response from backend', async () => {
  const response = await addPriorityToV2Items(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  backend.mockRejectedValue(backendUnauthenticatedError)

  const response = await addPriorityToV2Items(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.DATASET_ITEMS_ADD_PRIORITY[401],
      status: 401
    })
  })
})
