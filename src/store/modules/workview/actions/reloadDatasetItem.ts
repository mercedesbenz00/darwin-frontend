import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types'
import { loadDatasetItem as backendLoadDatasetItem, LoadDatasetItemParams } from '@/utils/backend'
import { loadDatasetItem as tutorialLoadDatasetItem } from '@/utils/tutorialBackend'

type ReloadDatasetItemAction = WorkviewAction<DatasetItemPayload, DatasetItemPayload>

const reloadDatasetItem: ReloadDatasetItemAction = async ({ commit, state }, item) => {
  const params: LoadDatasetItemParams = {
    datasetId: item.dataset_id,
    id: item.id
  }

  const response = state.tutorialMode
    ? tutorialLoadDatasetItem(params)
    : await backendLoadDatasetItem(params)

  if ('error' in response) { return response }
  if ('data' in response && 'items' in response.data) {
    const action = 'workview/reloadDatasetItem'
    const message = 'Expected a non pagination response from items endpoint'
    throw new Error(`${action}: ${message}`)
  }

  commit('PUSH_DATASET_ITEM', response.data)
  return { data: response.data }
}

export default reloadDatasetItem
