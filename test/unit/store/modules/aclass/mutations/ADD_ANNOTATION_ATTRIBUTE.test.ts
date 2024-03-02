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

const MUTATION = 'aclass/ADD_ANNOTATION_ATTRIBUTE'

it('should push a new attribute into state', () => {
  const attribute = buildAttributePayload({})

  store.commit(MUTATION, attribute)
  expect(store.state.aclass.attributes).toEqual([attribute])
})

it('should update attribute if existing', () => {
  const attribute = buildAttributePayload({ id: 'id1', name: 'Attribute 1' })
  const attribute2 = buildAttributePayload({ id: 'id1', name: 'Attribute 2' })

  store.commit(MUTATION, attribute)
  expect(store.state.aclass.attributes).toEqual([attribute])
  store.commit(MUTATION, attribute2)
  expect(store.state.aclass.attributes).toEqual([attribute2])
})
