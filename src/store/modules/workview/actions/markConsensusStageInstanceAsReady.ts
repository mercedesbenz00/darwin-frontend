import { WorkviewAction } from '@/store/modules/workview/types'
import { StageType } from '@/store/types'
import { sendV2Commands } from '@/utils/backend'
import { AUTO_COMPLETE_ACTUAL_TIME_MS } from '@/utils/workflows'

export const markConsensusStageInstanceAsReady: WorkviewAction<void, void> =
  async ({ commit, state, rootState}) => {
    if (!state.dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }
    if (!state.v2WorkflowItemState) { throw new Error('Item state not loaded') }

    const stageInstance = state.v2WorkflowItemState.current_stage_instances.find(
      i => i.stage.type === StageType.Annotate && i.user_id === rootState.user.profile?.id
    )

    if (!stageInstance) { throw new Error('Current stage is of wrong type') }

    commit('SET_V2_AUTOCOMPLETE', stageInstance)

    const response = await sendV2Commands({
      datasetItemId: state.selectedDatasetItemV2Id,
      teamSlug: state.dataset.team_slug,
      commands: [
        {
          type: 'transition_via_edge',
          data: {
            delay_ms: AUTO_COMPLETE_ACTUAL_TIME_MS,
            stage_id: stageInstance.stage_id
          }
        }
      ]
    })

    if ('data' in response) {
      return { data: undefined }
    } else {
      commit('CLEAR_V2_AUTOCOMPLETE', stageInstance)
      commit('SET_ERROR', response.error)
      return { error: response.error }
    }
  }
