import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildStageAnnotation, buildWorkflowStagePayload } from 'test/unit/factories'

import { selectedStageNonTagAnnotations } from '@/store/modules/workview/getters/selectedStageNonTagAnnotations'
import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'
import { RootState, WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: WorkviewState
let getters: {
  nonTagSortedAnnotationsByStage: (stage: WorkflowStagePayload, currentFrameIndex?: number) => StageAnnotation[]
}
let rootState: RootState
const rootGetters = {}

let annotation1: StageAnnotation
let annotation2: StageAnnotation

beforeEach(() => {
  const store = createTestStore()
  state = store.state.workview
  rootState = store.state

  annotation1 = buildStageAnnotation({ annotation_class_id: 1 })
  annotation2 = buildStageAnnotation({ annotation_class_id: 2 })
  getters = {
    nonTagSortedAnnotationsByStage: (stage: WorkflowStagePayload) => {
      annotation1.workflow_stage_id = stage.id
      annotation2.workflow_stage_id = stage.id
      return [annotation1, annotation2]
    }
  }
})

describe('selectedStageNonTagAnnotations', () => {
  it('returns empty array when there is no selected stage', () => {
    state.selectedStageInstance = null
    expect(
      selectedStageNonTagAnnotations(state, getters, rootState, rootGetters)
    ).toEqual([])
  })

  it('returns the non-tag annotations', () => {
    state.selectedStageInstance = buildWorkflowStagePayload({ id: 1 })
    expect(
      selectedStageNonTagAnnotations(state, getters, rootState, rootGetters)
    ).toEqual([annotation1, annotation2])
  })
})
