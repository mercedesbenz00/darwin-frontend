import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { StoreMutationPayload } from '@/store/types'

import { SET_EDITED_WORKFLOW } from './SET_EDITED_WORKFLOW'

const localVue = createLocalVue()
localVue.use(Vuex)

const workflow = buildV2WorkflowPayload({
  id: '1',
  name: 'Test',
  stages: []
})

const workflow2 = buildV2WorkflowPayload({
  id: '2'
})

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'v2Workflow/SET_EDITED_WORKFLOW'

const mutate = (payload: StoreMutationPayload<typeof SET_EDITED_WORKFLOW>): void =>
  store.commit(MUTATION, payload)

it('sets edited workflow', () => {
  expect(store.state.v2Workflow.editedWorkflow).toEqual(null)
  mutate(workflow)
  expect(store.state.v2Workflow.editedWorkflow).toEqual(workflow)
})

it('overrides edited workflow', () => {
  mutate(workflow)
  expect(store.state.v2Workflow.editedWorkflow).toEqual(workflow)
  mutate(workflow2)
  expect(store.state.v2Workflow.editedWorkflow).toEqual(workflow2)
})

it('sets same workflow', () => {
  mutate(workflow)
  mutate(workflow)
  expect(store.state.v2Workflow.editedWorkflow).toEqual(workflow)
})
