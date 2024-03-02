import { WorkflowMutation } from '@/store/modules/workview/types'
import { loadStageAnnotationPayload } from '@/store/modules/workview/utils'
import { StageAnnotationPayload } from '@/store/types/StageAnnotationPayload'
import { WorkflowStagePayload } from '@/store/types/WorkflowStagePayload'

type Payload = { stage: WorkflowStagePayload, annotations: StageAnnotationPayload[], wf2: boolean }

export const SET_STAGE_ANNOTATIONS: WorkflowMutation<Payload> = (state, payload) => {
  // The `wf2` boolean is used here because in Workflows 2.0 Annotations are related
  // to Dataset Items and not to Stages as in WF1.0
  const baseAnnotations = payload.wf2
    ? []
    : (state.stageAnnotations.filter(a => a.workflow_stage_id !== payload?.stage?.id))

  state.stageAnnotations = payload?.annotations
    ? baseAnnotations.concat(payload.annotations.map(loadStageAnnotationPayload))
    : baseAnnotations
}
