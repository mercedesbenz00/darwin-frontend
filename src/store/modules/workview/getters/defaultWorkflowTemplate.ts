import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import {
  DatasetPayload,
  RootState,
  WorkflowTemplatePayload
} from '@/store/types'

export const defaultWorkflowTemplate: Getter<WorkviewState, RootState> = (state: WorkviewState) =>
  (dataset: DatasetPayload): WorkflowTemplatePayload | null =>
    state.workflowTemplates.find(t => t.id === dataset.default_workflow_template_id) || null
