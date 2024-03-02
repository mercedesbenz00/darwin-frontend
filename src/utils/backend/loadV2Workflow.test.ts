import {
  buildAxiosResponse,
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { StageType } from '@/store/types/StageType'
import { api, errorMessages } from '@/utils'
import { loadV2Workflow } from '@/utils/backend/index'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof loadV2Workflow>[0]
const stage = buildV2WorkflowStagePayload({ type: StageType.Annotate })
const key = buildV2WorkflowPayload({
  id: '1',
  name: 'Test',
  stages: [stage]
})

beforeEach(() => {
  apiPost = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: key }))
  payload = {
    teamSlug: 'v7',
    workflowId: '1'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await loadV2Workflow(payload)
  expect(apiPost).toHaveBeenCalledWith('v2/teams/v7/workflows/1')
})

it('returns response from backend', async () => {
  const response = await loadV2Workflow(payload)
  expect(response).toEqual(expect.objectContaining({ data: key }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadV2Workflow(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKFLOWS_LOAD[401],
      status: 401
    })
  })
})
