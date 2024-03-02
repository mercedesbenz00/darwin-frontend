import { StageType, WorkflowActionPayload, WorkflowActionType } from '@/store/types'

type Params = Partial<WorkflowActionPayload>

export const buildWorkflowActionPayload =
  (params: Params = {}): WorkflowActionPayload => ({
    annotations: 5,
    from_stage_id: -1,
    from_stage_template_id: -1,
    from_type: StageType.Annotate,
    id: -1,
    inserted_at: '2020-05-05T00:00:00',
    to_stage_template_id: -1,
    to_type: StageType.Review,
    type: WorkflowActionType.Sent,
    user_id: -1,
    workflow_id: -1,
    workflow_template_id: -1,
    workflow_template_name: 'Default (A > R)',
    ...params
  })
