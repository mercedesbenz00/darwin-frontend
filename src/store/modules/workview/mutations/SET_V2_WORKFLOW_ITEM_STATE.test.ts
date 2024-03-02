import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowItemStatePayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'workview/SET_V2_WORKFLOW_ITEM_STATE'

it('sets item state', () => {
  const itemState = buildV2WorkflowItemStatePayload({})
  store.commit(MUTATION, itemState)
  expect(store.state.workview.v2WorkflowItemState).toBe(itemState)
})
