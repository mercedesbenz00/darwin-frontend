import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowStagePayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('sets selected stage', () => {
  const stage = buildV2WorkflowStagePayload({})
  store.commit('workview/SET_V2_SELECTED_STAGE', stage)
  expect(store.state.workview.v2SelectedStage).toBe(stage)
})
