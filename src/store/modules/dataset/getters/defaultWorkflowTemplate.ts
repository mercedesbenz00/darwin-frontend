import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'

/**
 * Getter to get the default workflow template of the current dataset
 */
export const defaultWorkflowTemplate: Getter<DatasetState, RootState> = (state) =>
  (dataset: DatasetPayload) =>
    state.workflowTemplates.find(template => template.id === dataset.default_workflow_template_id)
