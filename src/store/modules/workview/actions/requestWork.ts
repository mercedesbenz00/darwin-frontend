import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetPayload, DatasetItemPayload } from '@/store/types'
import { DatasetItemsLoadingState } from '@/store/types/DatasetItemsLoadingState'
import { requestWork as request } from '@/utils/backend'

type RequestWorkAction = WorkviewAction<DatasetPayload, DatasetItemPayload[]>

const requestWork: RequestWorkAction = async ({ commit }, dataset) => {
  commit('SET_DATASET_ITEMS_LOADING', DatasetItemsLoadingState.Loading)
  const response = await request({ datasetId: dataset.id })

  commit('SET_DATASET_ITEMS_LOADING', DatasetItemsLoadingState.Loaded)
  if ('data' in response) { commit('PUSH_DATASET_ITEMS', response.data) }

  return response
}

export default requestWork
