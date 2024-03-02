import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { StoreMutationPayload } from '@/store/types'

import { SET_EDITED_WORKFLOW_NAME } from './SET_EDITED_WORKFLOW_NAME'

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
})

const MUTATION = 'v2Workflow/SET_EDITED_WORKFLOW_NAME'
let payload: StoreMutationPayload<typeof SET_EDITED_WORKFLOW_NAME>

describe('when edited workflow exists', () => {
  beforeEach(() => {
    store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  })

  it('updates name of edited workflow', () => {
    payload = 'foo'
    store.commit(MUTATION, payload)
    expect(store.state.v2Workflow.editedWorkflow?.name).toEqual('foo')
  })
})

describe('when there is no edited workflow', () => {
  it('does nothing', () => {
    payload = 'foo'
    store.commit(MUTATION, payload)
    expect(store.state.v2Workflow.editedWorkflow).toBe(null)
  })
})
