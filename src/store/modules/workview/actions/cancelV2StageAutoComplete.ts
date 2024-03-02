import { WorkviewAction } from '@/store/modules/workview/types'
import { sendV2Commands } from '@/utils/backend'

export const cancelV2StageAutoComplete: WorkviewAction<void, void> =
  async ({ commit, state }) => {
    const { dataset, v2WorkflowItemState } = state
    if (!dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }
    if (!v2WorkflowItemState) { throw new Error('Item state not loaded') }

    const response = await sendV2Commands({
      commands: [{ data: {}, type: 'cancel' }],
      teamSlug: dataset.team_slug,
      datasetItemId: state.selectedDatasetItemV2Id
    })

    if ('data' in response) {
      return { data: undefined }
    } else {
      commit('SET_ERROR', response.error)
      return { error: response.error }
    }
  }
