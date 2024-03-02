import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassImagePayload,
  buildAnnotationClassPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { updateAnnotationClass } from '@/store/modules/aclass/actions/updateAnnotationClass'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateAnnotationClass: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const response = buildAnnotationClassPayload({ id: 1 })

const ACTION = 'aclass/updateAnnotationClass'
let payload: StoreActionPayload<typeof updateAnnotationClass>

const annotationClass = buildAnnotationClassPayload({ id: 1, annotation_types: ['polygon'] })

beforeEach(() => {
  store = createUnstubbedTestStore()
  setDefaultAnnotationTypes(store)
  jest.spyOn(backend, 'updateAnnotationClass')
    .mockResolvedValue(buildAxiosResponse({ data: response }))
  payload = {
    id: 1,
    annotationTypeNames: ['polygon', 'bounding_box'],
    datasets: [{ id: 7 }],
    name: 'Foo',
    metadata: { _color: 'rgba(1,1,1,1)' },
    description: 'Bar',
    images: [buildAnnotationClassImagePayload({ id: 'foo' })]
  }
  store.commit('aclass/PUSH_CLASS', annotationClass)
})

afterEach(() => {
  (backend.updateAnnotationClass as jest.Mock).mockReset()
})

it('raises if class not in store', async () => {
  store.commit('aclass/REMOVE_CLASSES', [annotationClass.id])
  await expect(store.dispatch(ACTION, payload)).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.updateAnnotationClass).toHaveBeenCalledWith({
    annotation_type_ids: [1, 7],
    datasets: [{ id: 7 }],
    description: 'Bar',
    id: 1,
    images: payload.images,
    metadata: { _color: 'rgba(1,1,1,1)' },
    name: 'Foo'
  })
})

it('does not send unchanged keys to backend', async () => {
  payload = {
    annotationTypeNames: ['polygon'],
    datasets: annotationClass.datasets,
    description: annotationClass.description,
    id: 1,
    images: annotationClass.images,
    metadata: annotationClass.metadata,
    name: annotationClass.name
  }
  await store.dispatch(ACTION, payload)
  expect(backend.updateAnnotationClass).toHaveBeenCalledWith({ id: 1 })
})

it('does not send omitted keys to backend', async () => {
  await store.dispatch(ACTION, { id: 1 })
  expect(backend.updateAnnotationClass).toHaveBeenCalledWith({ id: 1 })
})

it('commits class into store, overwriting previous', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.classes).toEqual([response])

  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.classes).toEqual([response])
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'updateAnnotationClass').mockResolvedValue({ error: fakeError })
  const result = await store.dispatch(ACTION, payload)
  expect(result.error).toEqual(fakeError)
})
