import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2DARCWorkflow, } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('unplugs stage from in and out', () => {
  const workflow = buildV2DARCWorkflow()

  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  
  expect(store.state.v2Workflow.editedWorkflow?.stages[0].edges.length).toBe(1)
  
  store.commit('v2Workflow/UNPLUG_STAGE', workflow.stages[0].id)
  expect(store.state.v2Workflow.editedWorkflow?.stages[0].edges.length).toBe(0)
})
