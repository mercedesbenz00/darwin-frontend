import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { createWorkflow } from './createWorkflow'

mockApi()

let apiPost: jest.SpyInstance
const payload: Parameters<typeof createWorkflow>[0] = {
  datasetItemId: 1
}

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends to backend', async () => {
  await createWorkflow(payload)
  expect(apiPost).toHaveBeenCalledWith('dataset_items/1/workflow')
})

it('returns response from backend', async () => {
  const response = await createWorkflow(payload)
  expect(response).toEqual(expect.objectContaining({ data: {} }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createWorkflow(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKFLOW_CREATE[401],
      status: 401
    })
  })
})
