import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { setClassSelections } from '@/store/modules/aclass/actions/setClassSelections'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'aclass/setClassSelections'
let payload: StoreActionPayload<typeof setClassSelections>

beforeEach(() => {
  store = createUnstubbedTestStore()
  payload = { selections: [{ id: 1, selected: true }] }
})

it('sets classes selections to the store', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.classSelected).toEqual({
    1: true
  })
})
