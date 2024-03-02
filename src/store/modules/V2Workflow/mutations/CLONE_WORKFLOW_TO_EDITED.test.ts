import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2WorkflowPayload
} from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

const workflow = buildV2WorkflowPayload({
  id: '1',
  name: 'Test',
  stages: []
})

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('v2Workflow/SET_WORKFLOW', workflow)
})

const MUTATION = 'v2Workflow/CLONE_WORKFLOW_TO_EDITED'

it('clones workflowById and updated editedWorkflow', () => {
  store.commit('v2Workflow/SET_WORKFLOW', workflow)

  expect(store.state.v2Workflow.editedWorkflow).toBeFalsy()

  store.commit(MUTATION, '1')

  expect(store.state.v2Workflow.editedWorkflow).toBeTruthy()
  expect(store.state.v2Workflow.editedWorkflow?.id).toEqual('1')
})

it('should replace current editedWorkflow', () => {
  store.commit('v2Workflow/SET_WORKFLOW', { ...workflow, id: '2' })
  store.commit(MUTATION, '1')
  expect(store.state.v2Workflow.editedWorkflow?.id).toEqual('1')
  store.commit(MUTATION, '2')
  expect(store.state.v2Workflow.editedWorkflow?.id).toEqual('2')
})
