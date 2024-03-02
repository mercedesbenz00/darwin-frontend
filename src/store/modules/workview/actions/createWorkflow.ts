import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { createWorkflow as request } from '@/utils/backend'

export const createWorkflow: WorkviewAction<DatasetItemPayload, DatasetItemPayload> =
  async ({ commit, state }, item) => {
    const response = await request({ datasetItemId: item.id })

    if ('data' in response) {
      commit('PUSH_DATASET_ITEM', response.data)

      if (state.selectedDatasetItem?.id === item.id) {
        commit('SET_SELECTED_DATASET_ITEM', response.data)
      }
    }

    return response
  }
