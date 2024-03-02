import { buildClassUsagePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { ClassUsagePayload } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { loadClassUsage } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let params: Parameters<typeof loadClassUsage>[0]
let classUsage: ClassUsagePayload

beforeEach(() => {
  classUsage = buildClassUsagePayload()
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: classUsage }))
  params = {
    teamSlug: 'v7',
    annotation_class_ids: [1, 2, 3]
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadClassUsage(params)
  expect(apiGet).toHaveBeenCalledWith('/teams/v7/annotation_classes/usage',
    { annotation_class_ids: params.annotation_class_ids })
})

it('returns response from backend', async () => {
  const response = await loadClassUsage(params)
  expect(response).toEqual(expect.objectContaining({ data: classUsage }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadClassUsage(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.CLASS_USAGE_LOAD[401],
      status: 401
    })
  })
})
