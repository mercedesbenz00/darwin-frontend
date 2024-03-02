import { WorkviewAction } from '@/store/modules/workview/types'
import { SkippedReason, StageType } from '@/store/types'
import { sendV2Commands } from '@/utils/backend'

export const skipV2SelectedStageInstance: WorkviewAction<SkippedReason, void> =
  async ({ commit, state, rootState }, reason) => {
    const { dataset, v2SelectedStageInstance: instance } = state
    if (!dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }
    if (!instance) { throw new Error('No stage instance selected') }

    const commands: Parameters<typeof sendV2Commands>[0]['commands'] = []

    if (!instance.user_id && rootState.user.profile) {
      // we want to assign the stage to the current user if not already assigned
      commands.push({
        type: 'assign',
        data: {
          assignee_id: rootState.user.profile.id,
          stage_id: instance.stage_id
        }
      })
    }

    // the primary command we always send is skip
    commands.push({
      type: 'skip',
      data: { reason, stage_id: instance.stage_id }
    })

    // review stage behavior is, skipping also automatically transitions the stage
    if (
      (instance.stage.type === StageType.Annotate || instance.stage.type === StageType.Review) &&
      reason
    ) {
      commands.push({
        type: 'transition_via_edge',
        data: {
          delay_ms: 6000,
          stage_id: instance.stage_id,
          edge: 'approve'
        }
      })
    }

    const response = await sendV2Commands({
      datasetItemId: state.selectedDatasetItemV2Id,
      teamSlug: dataset.team_slug,
      commands
    })

    if ('data' in response) {
      return { data: undefined }
    } else {
      commit('SET_ERROR', response.error)
      return { error: response.error }
    }
  }
