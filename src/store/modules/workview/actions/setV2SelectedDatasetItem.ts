import { WorkviewAction } from '@/store/modules/workview/types'

export const setV2SelectedDatasetItem: WorkviewAction<string, void> =
  async ({ commit, dispatch, getters, rootState }, itemId) => {
    commit('SET_V2_SELECTED_DATASET_ITEM', itemId)

    if (getters.v2SelectedDatasetItem) { return }

    const currentTeam = rootState.team.currentTeam
    if (!currentTeam) { throw new Error('[storage/addStorage]: Current team not set') }

    const response = await dispatch('dataset/loadV2DatasetItem', {
      teamSlug: currentTeam.slug,
      itemId
    }, { root: true })

    commit('dataset/SET_V2_DATASET_ITEMS', [response.data], { root: true })
  }
