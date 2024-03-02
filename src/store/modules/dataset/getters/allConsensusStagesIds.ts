import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState, StageType, V2ConsensusStagePayload } from '@/store/types'

/**
  Returns all the consensus stages ids for the current dataset
  (works based on the 1st item in the dataset)
 */
export const allConsensusStagesIds: Getter<DatasetState, RootState> = (
  state,
  _getters,
  rootState
): string[] => {
  const firstDataItemId = state.datasetItemIdsV2[0] ?? ''
  const firstDataItem = state.datasetItemsV2[firstDataItemId]
  if (!firstDataItem) {
    return []
  }
  const wfId = firstDataItem.workflow_data?.workflow_id
  const workflow = rootState.v2Workflow.workflows.find((wf) => wf.id === wfId)
  const allConsensusStagesIds =
    workflow?.stages
      .filter(
        (stage): stage is V2ConsensusStagePayload =>
          stage.type === StageType.ConsensusEntrypoint
      )
      .flatMap((cs) => [
        cs.id,
        cs.config.test_stage_id,
        ...cs.config.parallel_stage_ids,
      ]) ?? []
  return allConsensusStagesIds
}
