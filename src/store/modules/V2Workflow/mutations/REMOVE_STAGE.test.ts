import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowStagePayload } from 'test/unit/factories'

import { StageType } from '@/store/types/StageType'
import { V2ConsensusStagePayload } from '@/store/types/V2WorkflowStagePayload'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const REMOVE_STAGE_MUTATION = 'v2Workflow/REMOVE_STAGE'

it('should remove stage from drafted workflow', () => {
  store.commit('v2Workflow/INITIALIZE_WORKFLOW')
  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-1',
      type: StageType.Review,
    })
  )

  expect(store.state.v2Workflow.editedWorkflow).toBeTruthy()
  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(5)

  store.commit(REMOVE_STAGE_MUTATION, 'stage-1')

  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(4)
})

it('should remove all stages part of a consensus stage and preserve the others', () => {
  store.commit('v2Workflow/INITIALIZE_WORKFLOW')
  expect(store.state.v2Workflow.editedWorkflow).toBeTruthy()
  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(4)

  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-1',
      type: StageType.Review,
    })
  )
  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-2',
      type: StageType.ConsensusEntrypoint,
      config: {
        test_stage_id: 'stage-3',
        parallel_stage_ids: ['stage-4', 'stage-5'],
      },
    })
  )
  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-3',
      type: StageType.ConsensusTest,
    })
  )

  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(7)

  store.commit(REMOVE_STAGE_MUTATION, 'stage-2')

  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(5)
})

it('should remove sub stage from stages and the id from the config of consensus stage', () => {
  store.commit('v2Workflow/INITIALIZE_WORKFLOW')
  expect(store.state.v2Workflow.editedWorkflow).toBeTruthy()
  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(4)

  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-1',
      type: StageType.Review,
    })
  )
  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-2',
      type: StageType.ConsensusEntrypoint,
      config: {
        test_stage_id: 'stage-3',
        parallel_stage_ids: ['stage-4', 'stage-5'],
      },
    })
  )
  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-3',
      type: StageType.ConsensusTest,
    })
  )

  store.commit(
    'v2Workflow/CREATE_STAGE',
    buildV2WorkflowStagePayload({
      id: 'stage-4',
      type: StageType.Annotate,
    })
  )

  expect(store.state.v2Workflow.editedWorkflow?.stages).toHaveLength(8)

  store.commit(REMOVE_STAGE_MUTATION, 'stage-4')

  expect(
    (store.state.v2Workflow.editedWorkflow?.stages.find(
      (s): s is V2ConsensusStagePayload => s.id === 'stage-2'
    )?.config)?.parallel_stage_ids
  ).toEqual(['stage-5'])
})
