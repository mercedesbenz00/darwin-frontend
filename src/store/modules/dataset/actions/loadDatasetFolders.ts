import { DatasetAction } from '@/store/modules/dataset/types'
import { LoadingStatus } from '@/store/types'
import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { loadDatasetFolders as request } from '@/utils/backend'

type Payload = { datasetId: number }
type Action = DatasetAction<Payload, DatasetFolderPayload[]>

export const LOADING_KEY = 'dataset/loadDatasetFolders'

export const loadDatasetFolders: Action = async (
  { commit, getters, state },
  { datasetId }
) => {
  if (datasetId !== state.currentDataset.id) { return }
  const params = {
    datasetId,
    ...(getters.datasetItemApiFilter as DatasetItemFilter)
  }

  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loading },
    { root: true }
  )

  const response = await request(params)
  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loaded },
    { root: true }
  )

  if ('data' in response) {
    commit('SET_DATASET_FOLDERS', { folders: response.data, datasetId })
  }

  return response
}
