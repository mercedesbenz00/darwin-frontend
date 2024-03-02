import { buildAxiosResponse } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { loadAnnotationClasses } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let payload: Parameters<typeof loadAnnotationClasses>[0]

beforeEach(() => {
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(
    buildAxiosResponse({
      data: {
        annotation_classes: [flask, bottle]
      }
    })
  )
  payload = { teamSlug: 'teamSlug' }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests annotation classes to backend', async () => {
  await loadAnnotationClasses(payload)
  expect(apiGet).toHaveBeenCalledWith('teams/teamSlug/annotation_classes', {})
})

it('passes params to backend', async () => {
  payload = {
    ...payload,
    dataset_ids: [1],
    not_dataset_ids: [2, 3],
    annotation_type_ids: [4],
    annotation_type_names: ['tag'],
    include_tags: false
  }
  await loadAnnotationClasses(payload)

  expect(apiGet).toHaveBeenCalledWith('teams/teamSlug/annotation_classes', {
    annotation_type_ids: [4],
    annotation_type_names: ['tag'],
    dataset_ids: [1],
    include_tags: false,
    not_dataset_ids: [2, 3]
  })
})

it('returns response from backend', async () => {
  const response = await loadAnnotationClasses(payload)
  expect(response).toEqual(buildAxiosResponse({
    data: {
      annotation_classes: [flask, bottle]
    }
  }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadAnnotationClasses({ teamSlug: 'teamSlug' })

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ANNOTATION_CLASS_LOAD[401],
      status: 401
    })
  })
})
