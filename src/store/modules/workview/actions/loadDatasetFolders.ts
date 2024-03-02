import { WorkviewAction } from '@/store/modules/workview/types'
import { LoadingStatus } from '@/store/types'
import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'
import { loadDatasetFolders as request } from '@/utils/backend/loadDatasetFolders'

type Action = WorkviewAction<void, DatasetFolderPayload[]>

export const LOADING_KEY = 'workview/loadDatasetFolders'

export const loadDatasetFolders: Action = async ({ commit, state }) => {
  const { dataset } = state

  // This action usually gets dispatched by a throttled function, so it will
  // commonly get called on such a delay where the user might navigate away
  // and the dataset is unset. In that case, it should just silently return.
  if (!dataset) { return }

  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loading },
    { root: true }
  )

  const params = {
    datasetId: dataset.id,
    ...state.datasetItemFilter
  }
  const response = await request(params)
  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loaded },
    { root: true }
  )

  if ('error' in response) { return response }
  commit('SET_DATASET_FOLDERS', { folders: response.data, datasetId: dataset.id })
  return response
}
