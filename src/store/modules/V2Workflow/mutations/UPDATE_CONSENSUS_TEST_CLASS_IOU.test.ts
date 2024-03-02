import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload,
} from 'test/unit/factories'

import { Payload } from '@/store/modules/V2Workflow/mutations/UPDATE_CONSENSUS_TEST_CLASS_IOU'
import { StageType } from '@/store/types/StageType'
import { V2WorkflowPayload } from '@/store/types/V2WorkflowPayload'
import { TestStageConfigPayload } from '@/store/types/V2WorkflowStageConfigPayload'
import { V2TestStagePayload } from '@/store/types/V2WorkflowStagePayload'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const UPDATE_CONSENSUS_TEST_CLASS_IOU =
  'v2Workflow/UPDATE_CONSENSUS_TEST_CLASS_IOU'

/* eslint-enable camelcase, max-len */

it('should add new pair to consensus-test-stage-iou-class', () => {
  const workflow = buildV2WorkflowPayload({
    stages: [
      buildV2WorkflowStagePayload({
        id: '1',
        type: StageType.ConsensusTest,
      }),
    ],
  })
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  store.commit(UPDATE_CONSENSUS_TEST_CLASS_IOU, {
    testStageId: '1',
    annotationClassId: 22,
    threshold: 0.4,
  } as Payload)

  const targetStage = (
    store.state.v2Workflow.editedWorkflow as V2WorkflowPayload
  ).stages[0] as V2TestStagePayload

  expect(targetStage.config.iou_thresholds.annotation_classes).toEqual([
    {
      annotation_class_id: 22,
      annotation_subtypes: [],
      threshold: 0.4,
    },
  ])
})

it('should update existing pair to consensus-test-stage-iou-class', () => {
  const workflow = buildV2WorkflowPayload({
    stages: [
      buildV2WorkflowStagePayload({
        id: '1',
        type: StageType.ConsensusTest,
        config: <Partial<TestStageConfigPayload>> {
          iou_thresholds: {
            general_threshold: 0.5,
            annotation_types: [],
            annotation_classes: [
              {
                annotation_class_id: 22,
                annotation_subtypes: [],
                threshold: 0.7,
              },
            ],
          },
        },
      }),
    ],
  })
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  store.commit(UPDATE_CONSENSUS_TEST_CLASS_IOU, {
    testStageId: '1',
    annotationClassId: 22,
    threshold: 0.4,
  } as Payload)

  const targetStage = (
    store.state.v2Workflow.editedWorkflow as V2WorkflowPayload
  ).stages[0] as V2TestStagePayload

  expect(targetStage.config.iou_thresholds.annotation_classes).toEqual([
    {
      annotation_class_id: 22,
      annotation_subtypes: [],
      threshold: 0.4,
    },
  ])
})
