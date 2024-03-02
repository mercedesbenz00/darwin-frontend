import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateAnnotationClass } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let params: Parameters<typeof updateAnnotationClass>[0]

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: {} }))
  params = {
    id: 1,
    annotation_type_ids: [1, 2, 3],
    description: null,
    images: [],
    metadata: { _color: 'auto' },
    name: 'class1',
    datasets: [{ id: 1 }]
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend with email', async () => {
  await updateAnnotationClass(params)
  expect(apiPut).toHaveBeenCalledWith('annotation_classes/1', {
    id: 1,
    annotation_type_ids: [1, 2, 3],
    description: null,
    images: [],
    name: 'class1',
    metadata: { _color: 'auto' },
    datasets: [{ id: 1 }]
  })
})

it('returns response from backend', async () => {
  const response = await updateAnnotationClass(params)
  expect(response).toEqual(buildAxiosResponse({ data: {} }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateAnnotationClass(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ANNOTATION_CLASS_CREATE[401],
      status: 401
    })
  })
})
