import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildEdgePayload,
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import { StageType } from '@/store/types/StageType'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'v2Workflow/RENAME_STAGE'

it('should rename targeted stage', () => {
  const stage = buildV2WorkflowStagePayload({
    type: StageType.Annotate,
    id: '1-s',
    name: 'Annotate',
    edges: [
      buildEdgePayload({
        id: '1',
        source_stage_id: '1',
        target_stage_id: '2'
      })
    ]
  })
  const workflow = buildV2WorkflowPayload({
    id: '1',
    name: 'Test',
    stages: [stage]
  })

  store.commit('v2Workflow/SET_WORKFLOW', workflow)
  store.commit('v2Workflow/CLONE_WORKFLOW_TO_EDITED', '1')

  expect(store.state.v2Workflow.editedWorkflow?.stages[0].name).toEqual('Annotate')

  store.commit(MUTATION, {
    id: '1-s',
    name: 'My custom stage'
  })

  expect(store.state.v2Workflow.editedWorkflow?.stages[0].name).toEqual('My custom stage')
})
