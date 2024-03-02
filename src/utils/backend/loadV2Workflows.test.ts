import { buildAxiosResponse, buildV2WorkflowPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'

import { loadV2Workflows } from './loadV2Workflows'

mockApi()

let apiGet: jest.SpyInstance
const payload: Parameters<typeof loadV2Workflows>[0] = {
  teamSlug: 'bar'
}

const response = [
  buildV2WorkflowPayload({ id: 'foo' }),
  buildV2WorkflowPayload({ id: 'bar' })
]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: response }))
})

afterEach(() => {
  apiGet.mockReset()
})

it('sends to backend', async () => {
  await loadV2Workflows(payload)
  expect(apiGet).toHaveBeenCalledWith('v2/teams/bar/workflows', {})
})

it('returns response from backend', async () => {
  const result = await loadV2Workflows(payload)
  expect(result).toEqual(expect.objectContaining({ data: response }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2Workflows(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKFLOWS_LOAD[401],
      status: 401
    })
  })
})
