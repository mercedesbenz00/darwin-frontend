import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAttributePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { deleteAnnotationAttribute } from '@/store/modules/aclass/actions/deleteAnnotationAttribute'
import { StoreActionPayload } from '@/store/types'
import { api, errorMessages } from '@/utils'

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)
let apiRemove: jest.SpyInstance
let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'aclass/deleteAnnotationAttribute'
let payload: StoreActionPayload<typeof deleteAnnotationAttribute>
const attribute = buildAttributePayload({})

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attribute)
  apiRemove = jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: attribute }))
  payload = {
    classId: 1,
    id: 2
  }
})

afterEach(() => {
  apiRemove.mockReset()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  expect(apiRemove).toHaveBeenCalledWith('annotation_classes/1/attributes/2')
})

it('deletes annotation attributes from the store', async () => {
  expect(store.state.aclass.attributes).toHaveLength(1)
  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.attributes).toHaveLength(0)
})

it('parses and returns error on backend error', async () => {
  apiRemove.mockRejectedValue(backendUnauthenticatedError)

  const response = await store.dispatch(ACTION, payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ATTRIBUTE_DELETE.default,
      status: 401
    })
  })
})
