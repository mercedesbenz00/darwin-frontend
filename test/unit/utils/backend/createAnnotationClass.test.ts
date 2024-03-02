import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createAnnotationClass } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let params: Parameters<typeof createAnnotationClass>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: {} }))
  params = {
    annotation_type_ids: [1, 2, 3],
    datasets: [{ id: 1 }],
    description: null,
    images: [],
    metadata: { _color: 'auto' },
    name: 'class1',
    team_slug: 'v7'
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend with email', async () => {
  await createAnnotationClass(params)
  expect(apiPost).toHaveBeenCalledWith('teams/v7/annotation_classes', {
    annotation_type_ids: [1, 2, 3],
    datasets: [{ id: 1 }],
    description: null,
    images: [],
    metadata: { _color: 'auto' },
    name: 'class1'
  })
})

it('returns response from backend', async () => {
  const response = await createAnnotationClass(params)
  expect(response).toEqual(buildAxiosResponse({ data: {} }))
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createAnnotationClass(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ANNOTATION_CLASS_CREATE[401],
      status: 401
    })
  })
})
