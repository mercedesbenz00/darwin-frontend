import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowPayload, buildV2WorkflowStagePayload } from 'test/unit/factories'

import { StageType } from '@/store/types/StageType'
import { V2WorkflowPayload } from '@/store/types/V2WorkflowPayload'
import { V2AnnotateStagePayload } from '@/store/types/V2WorkflowStagePayload'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'v2Workflow/UPDATE_ASSIGNABLE_USERS'

const workflow = buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      id: '1',
      type: StageType.Annotate
    })
  ]
})

/* eslint-disable camelcase, max-len */
it('should update assignable users', () => {
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  store.commit(MUTATION, {
    stageId: '1',
    assignable_users: [{ user_id: 1 }]
  })

  const targetStage = (store.state.v2Workflow.editedWorkflow as V2WorkflowPayload).stages[0] as V2AnnotateStagePayload

  expect(targetStage.assignable_users).toBeTruthy()
  expect(targetStage.assignable_users?.find(({ user_id }) => user_id === 1)).toBeTruthy()
  store.commit(MUTATION, {
    stageId: '1',
    assignable_users: [{ user_id: 2 }, { user_id: 3 }, { user_id: 4 }, { user_id: 5 }]
  })
  expect(targetStage.assignable_users?.find(({ user_id }) => user_id === 1)).toBeFalsy()
  expect(targetStage.assignable_users?.length).toEqual(4)
})
/* eslint-enable camelcase, max-len */
