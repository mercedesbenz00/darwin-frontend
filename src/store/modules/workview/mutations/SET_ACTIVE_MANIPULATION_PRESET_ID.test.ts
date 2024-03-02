import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'workview/SET_ACTIVE_MANIPULATION_PRESET_ID'

it('should set activePresetId', () => {
  store.commit(MUTATION, 1)
  expect(store.state.workview.activePresetId).toEqual(1)
})
