import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowStageInstancePayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('sets selected stage instance', () => {
  const instance = buildV2WorkflowStageInstancePayload({})
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
  expect(store.state.workview.v2SelectedStageInstance).toBe(instance)
})
