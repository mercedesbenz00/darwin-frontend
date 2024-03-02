import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAttributePayload, buildAxiosResponse } from 'test/unit/factories'

import { loadClassAnnotationAttributes } from '@/store/modules/aclass/actions/loadClassAnnotationAttributes'
import { AttributePayload, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

describe('aclass/loadClassAnnotationAttributes', () => {
  const action = 'aclass/loadClassAnnotationAttributes'

  const payload: StoreActionPayload<typeof loadClassAnnotationAttributes> = { classId: 5 }

  const response: AttributePayload =
    buildAttributePayload({ id: 'fake', class_id: 5, color: 'ABCDEF', name: 'Attribute' })

  beforeEach(() => {
    jest
      .spyOn(backend, 'loadClassAnnotationAttributes')
      .mockResolvedValue(buildAxiosResponse({ data: [response] }))

    jest
      .spyOn(tutorialBackend, 'loadClassAnnotationAttributes')
      .mockReturnValue({ data: [response] })
  })

  it('sends request to backend', async () => {
    await store.dispatch(action, payload)
    expect(backend.loadClassAnnotationAttributes).toHaveBeenCalledWith(payload)
  })

  it('pushes data to store', async () => {
    await store.dispatch(action, payload)
    expect(store.state.aclass.attributes).toEqual([{
      class_id: 5, color: 'ABCDEF', id: 'fake', name: 'Attribute'
    }])
  })

  it('returns parsed error on failure', async () => {
    const error = { message: 'Fake error', isValidationError: false }
    jest.spyOn(backend, 'loadClassAnnotationAttributes').mockResolvedValue({ error })
    const result = await store.dispatch(action, payload)
    expect(result.error).toEqual(error)
  })

  it('dispatches toast on failure', async () => {
    const error = { message: 'Fake error', isValidationError: false }
    jest.spyOn(backend, 'loadClassAnnotationAttributes').mockResolvedValue({ error })
    await store.dispatch(action, payload)
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: error.message })
  })

  it('sends request to tutorial backend', async () => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
    await store.dispatch(action, payload)
    expect(tutorialBackend.loadClassAnnotationAttributes).toHaveBeenCalledWith(payload)
  })
})
