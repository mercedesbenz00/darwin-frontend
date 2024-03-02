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

const MUTATION = 'workview/PUSH_PRESET'

it('should add a new preset or replace existing preset', () => {
  const preset = buildPresetPayload({ id: 1 })
  store.commit(MUTATION, preset)
  expect(store.state.workview.presets).toEqual([preset])

  store.commit(MUTATION, preset)
  expect(store.state.workview.presets).toEqual([preset])
})
