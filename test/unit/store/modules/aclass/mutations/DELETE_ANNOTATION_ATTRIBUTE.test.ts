import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAttributePayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'aclass/DELETE_ANNOTATION_ATTRIBUTE'

it('should remove existing attribute', () => {
  const attribute = buildAttributePayload({})
  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attribute)
  expect(store.state.aclass.attributes).toEqual([attribute])

  store.commit(MUTATION, attribute)
  expect(store.state.aclass.attributes).toEqual([])
})

it('should update attribute if existing', () => {
  const attribute = buildAttributePayload({ id: 'id1' })
  const attribute2 = buildAttributePayload({ id: 'id2' })

  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attribute)
  expect(store.state.aclass.attributes).toEqual([attribute])

  store.commit(MUTATION, attribute2)
  expect(store.state.aclass.attributes).toEqual([attribute])
})
