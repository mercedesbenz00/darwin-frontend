import { WorkflowMutation } from '@/store/modules/V2Workflow/types'
import { StageType } from '@/store/types/StageType'
import { V2TestStagePayload } from '@/store/types/V2WorkflowStagePayload'

export type Payload = {
  testStageId: string;
  annotationClassId: number;
  threshold: number;
  annotationSubtypes?: string[];
};

export const UPDATE_CONSENSUS_TEST_CLASS_IOU: WorkflowMutation<Payload> = (
  state,
  {
    testStageId,
    annotationClassId,
    threshold,
    annotationSubtypes = [],
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
    annotation_classes: [
      ...stage.config.iou_thresholds.annotation_classes.filter(
        (x) => x.annotation_class_id !== annotationClassId
      ),
      {
        annotation_class_id: annotationClassId,
        threshold,
        annotation_subtypes: annotationSubtypes,
      },
    ],
  }
}
