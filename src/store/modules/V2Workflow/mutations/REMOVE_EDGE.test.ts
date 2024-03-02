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

const REMOVE_MUTATION = 'v2Workflow/REMOVE_EDGE'

it('removes edge from specific workflow stage', () => {
  const stage = buildV2WorkflowStagePayload({
    type: StageType.Annotate,
    id: '1-s',
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

  store.commit(REMOVE_MUTATION, {
    stageId: '1-s',
    sourceStageId: '1',
    targetStageId: '2'
  })

  expect(store.state.v2Workflow.editedWorkflow?.stages[0].edges).toHaveLength(0)
})

it('removes one edge from two outgoing edges by name', () => {
  const review = buildV2WorkflowStagePayload({
    type: StageType.Review,
    id: '1',
    edges: [
      buildEdgePayload({
        id: '1',
        name: 'approve',
        source_stage_id: '1',
        target_stage_id: '2'
      }),
      buildEdgePayload({
        id: '2',
        name: 'reject',
        source_stage_id: '1',
        target_stage_id: '3'
      })
    ]
  })
  const workflow = buildV2WorkflowPayload({
    id: '1',
    name: 'Test',
    stages: [review]
  })

  store.commit('v2Workflow/SET_WORKFLOW', workflow)
  store.commit('v2Workflow/CLONE_WORKFLOW_TO_EDITED', '1')

  store.commit(REMOVE_MUTATION, {
    sourceStageId: '1',
    name: 'reject'
  })

  expect(store.state.v2Workflow.editedWorkflow?.stages[0].edges).toHaveLength(1)
})
