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

const MUTATION = 'v2Workflow/SET_WORKFLOW'

it('sets workflow', () => {
  const workflow = buildV2WorkflowPayload()

  store.commit(MUTATION, workflow)
  expect(store.state.v2Workflow.workflows).toEqual([workflow])
})

it('sets workflow without duplicate', () => {
  const workflow = buildV2WorkflowPayload({ id: '1' })

  store.commit(MUTATION, workflow)
  expect(store.state.v2Workflow.workflows).toEqual([workflow])
  store.commit(MUTATION, workflow)
  expect(store.state.v2Workflow.workflows).toEqual([workflow])
})
