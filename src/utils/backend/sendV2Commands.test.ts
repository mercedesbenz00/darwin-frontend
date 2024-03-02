import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { CancelCommand, CreateAnnotationCommand } from '@/store/types/V2WorkflowCommandPayload'
import { api, errorMessages } from '@/utils'

import { sendV2Commands } from './sendV2Commands'

mockApi()

let apiPost: jest.SpyInstance

const cancelCommand: CancelCommand = {
  data: {},
  id: 'fake-uuid',
  type: 'cancel',
  user_id: 1
}

const createAnnotationCommand: CreateAnnotationCommand = {
  data: {
    annotation_class_id: 1,
    annotation_group_id: '1',
    annotation_id: '1',
    data: { x: 0 },
    metadata: {},
    stage_id: '1',
    z_index: 1
  },
  id: 'fake-uuid',
  type: 'create_annotation'
}

const payload: Parameters<typeof sendV2Commands>[0] = {
  datasetItemId: 'bat',
  commands: [cancelCommand],
  teamSlug: 'v7'
}

const payloadAnnotation: Parameters<typeof sendV2Commands>[0] = {
  datasetItemId: 'bat',
  commands: [createAnnotationCommand],
  teamSlug: 'v7'
}

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends to backend', async () => {
  await sendV2Commands(payload)
  expect(apiPost).toHaveBeenCalledWith('v2/teams/v7/items/bat/commands', {
    commands: payload.commands
  })
})

it('returns response from backend', async () => {
  const response = await sendV2Commands(payload)
  expect(response).toEqual(expect.objectContaining({ data: {} }))
})

it('parses and returns error on backend error for workflow commands', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await sendV2Commands(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.WORKFLOW_CREATE[401],
      status: 401
    })
  })
})

it('parses and returns annotation error on backend error for annotation commands', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await sendV2Commands(payloadAnnotation)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ANNOTATION_CREATE[401],
      status: 401
    })
  })
})
