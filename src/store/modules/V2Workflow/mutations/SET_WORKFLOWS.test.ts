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

const MUTATION = 'v2Workflow/SET_WORKFLOWS'

it('sets workflows', async () => {
  const currentWorkflows = store.state.v2Workflow.workflows
  const workflows = [
    buildV2WorkflowPayload({ id: 'foo' }),
    buildV2WorkflowPayload({ id: 'bar' })
  ]

  await store.commit(MUTATION, workflows)
  expect(store.state.v2Workflow.workflows).toEqual([...currentWorkflows, ...workflows])
})
