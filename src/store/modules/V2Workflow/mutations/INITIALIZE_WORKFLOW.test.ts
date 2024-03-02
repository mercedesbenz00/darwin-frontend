import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'v2Workflow/INITIALIZE_WORKFLOW'

it('should create new workflow mock and replace/paste into state', () => {
  expect(store.state.v2Workflow.editedWorkflow).toBeFalsy()

  store.commit(MUTATION)

  expect(store.state.v2Workflow.editedWorkflow).toBeTruthy()
  expect(store.state.v2Workflow.editedWorkflow?.id).toEqual('new-workflow')
})
