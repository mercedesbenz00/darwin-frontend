import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import { StageType } from '@/store/types/StageType'
import { V2TestStagePayload } from '@/store/types/V2WorkflowStagePayload'

export type Payload = {
  testStageId: string;
  type: AnnotationTypeName;
  threshold: number;
};

export const UPDATE_CONSENSUS_TEST_TYPE_IOU: WorkflowMutation<Payload> = (
  state,
  {
    testStageId,
    type,
    threshold,
  }
) => {
  const workflow = state.editedWorkflow

  if (!workflow) {
    return
  }

  const stage = workflow.stages.find(
    (s): s is V2TestStagePayload =>
      s.type === StageType.ConsensusTest && s.id === testStageId
  )
  if (!stage) {
    return
  }

  stage.config.iou_thresholds = {
    ...stage.config.iou_thresholds,
    annotation_types: [
      ...stage.config.iou_thresholds.annotation_types.filter(
        (x) => x.annotation_type !== type
      ),
      {
        annotation_type: type,
        threshold,
      },
    ],
  }
}
