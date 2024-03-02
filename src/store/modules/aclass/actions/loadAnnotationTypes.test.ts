import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAnnotationTypePayload } from 'test/unit/factories'

import { LoadingStatus } from '@/store/types'
import * as backend from '@/utils/backend'

const types = [
  buildAnnotationTypePayload({ id: 1, name: 'polygon', granularity: 'main' }),
  buildAnnotationTypePayload({ id: 2, name: 'bounding_box', granularity: 'main' }),
  buildAnnotationTypePayload({ id: 3, name: 'text', granularity: 'sub' })
]

jest.mock('@/utils/backend', () => ({ loadAnnotationTypes: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'aclass/loadAnnotationTypes'

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadAnnotationTypes')
    .mockResolvedValue({ data: types })
})

afterEach(() => {
  (backend.loadAnnotationTypes as jest.Mock).mockReset()
})

it('calls correct API endpoint', async () => {
  await store.dispatch(ACTION)

  expect(backend.loadAnnotationTypes).toHaveBeenCalledWith()
})

it('sets types onto store', async () => {
  await store.dispatch(ACTION)

  expect(store.state.aclass.types).toEqual(types)

  await store.dispatch(ACTION)
  expect(store.state.aclass.types).toEqual(types)
})

it('skips loading if types already loading', async () => {
  store.commit('aclass/SET_TYPES_LOADING_STATUS', LoadingStatus.Loading)
  await store.dispatch(ACTION)
  expect(backend.loadAnnotationTypes).not.toHaveBeenCalled()
})
