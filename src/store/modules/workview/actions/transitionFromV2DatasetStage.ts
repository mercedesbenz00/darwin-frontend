import { WorkviewAction } from '@/store/modules/workview/types'
import { sendV2Commands } from '@/utils/backend'

export const transitionFromV2DatasetStage: WorkviewAction<void, void> =
  async ({ commit, state }) => {
    if (!state.dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }
    if (!state.v2SelectedStageInstance) { throw new Error('No instance selected') }

    const response = await sendV2Commands({
      datasetItemId: state.selectedDatasetItemV2Id,
      teamSlug: state.dataset.team_slug,
      commands: [
        {
          type: 'transition_via_edge',
          data: {
            edge: 'default',
            stage_id: state.v2SelectedStageInstance.stage_id
          }
        }
      ]
    })

    if ('data' in response) {
      return { data: undefined }
    } else {
      commit('SET_ERROR', response.error)
      return { error: response.error }
    }
  }
