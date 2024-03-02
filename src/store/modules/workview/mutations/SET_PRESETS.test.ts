import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildPresetPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'workview/SET_PRESETS'

it('should set presets', () => {
  const presets = [buildPresetPayload({ id: 1 })]
  store.commit(MUTATION, presets)
  expect(store.state.workview.presets).toEqual(presets)
})
