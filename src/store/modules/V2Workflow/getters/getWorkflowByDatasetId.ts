import { Getter } from 'vuex'

import {
  RootState,
  StageType,
  V2WorkflowPayload,
  V2Workflows,
  V2WorkflowStagePayload
} from '@/store/types'

const isInitialDatasetStage = (stage: V2WorkflowStagePayload, datasetId: number): boolean =>
  stage.type === StageType.Dataset && stage.config.initial && stage.config.dataset_id === datasetId

/**
 * Retrieves worfklow associated to the given dataset id.
 *
 * All current 2.0 workflows MUST start with a dataset stage, the config of which is
 * associated with a dataset by id.
 *
 * In the near future, a workflow might contain multiple dataset stages, so this getter
 * will have to be updated.
 *
 * In a farther future, a dataset stage might not be necessary for a workflow.
 */
export const getWorkflowByDatasetId: Getter<V2Workflows, RootState> = (state) => (
  datasetId: number
): V2WorkflowPayload | null =>
  state.workflows.find(w => w.stages.some(s => isInitialDatasetStage(s, datasetId))) || null
