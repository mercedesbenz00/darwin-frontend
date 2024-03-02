import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildAxiosResponse, buildDatasetPayload } from 'test/unit/factories'

import { removeFromDataset } from '@/store/modules/aclass/actions/removeFromDataset'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateAnnotationClass: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const dataset = buildDatasetPayload({ id: 2 })

const annotationClass = buildAnnotationClassPayload({ id: 1, datasets: [{ id: dataset.id }] })
const updatedAnnotationClass = { ...annotationClass, datasets: [] }

const ACTION = 'aclass/removeFromDataset'
let payload: StoreActionPayload<typeof removeFromDataset>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'updateAnnotationClass')
    .mockResolvedValue(buildAxiosResponse({ data: updatedAnnotationClass }))
  payload = { annotationClass, dataset }
})

afterEach(() => {
  (backend.updateAnnotationClass as jest.Mock).mockReset()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.updateAnnotationClass).toHaveBeenCalledWith({
    id: annotationClass.id,
    datasets: []
  })
})

it('pushes class to store', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.classes[0]).toEqual(updatedAnnotationClass)
})

it('returns error from backend', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'updateAnnotationClass').mockResolvedValue({ error })
  const result = await store.dispatch(ACTION, payload)
  expect(result.error).toEqual(error)
})
