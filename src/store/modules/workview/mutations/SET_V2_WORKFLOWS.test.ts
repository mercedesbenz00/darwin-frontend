import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('sets workflows', () => {
  const workflow = buildV2WorkflowPayload({})
  store.commit('workview/SET_V2_WORKFLOWS', [workflow])
  expect(store.state.workview.v2Workflows).toEqual([workflow])
})
