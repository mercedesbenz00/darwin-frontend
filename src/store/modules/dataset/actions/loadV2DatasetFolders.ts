import { DatasetAction } from '@/store/modules/dataset/types'
import { LoadingStatus } from '@/store/types'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'
import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { loadV2DatasetFolders as request } from '@/utils/backend'
import { LoadDatasetFolderParams } from '@/utils/backend/loadV2DatasetFolders'

type Payload = { datasetId: number, teamSlug: string }
type Action = DatasetAction<Payload, {folders: V2DatasetFolderPayload[]}>

export const LOADING_KEY = 'dataset/loadV2DatasetFolders'

export const loadV2DatasetFolders: Action = async (
  { commit, getters, state },
  { datasetId, teamSlug }
) => {
  if (datasetId !== state.currentDataset.id) { return }
  const {
    include_thumbnails: includeThumbNails,
    ...filters
  } = getters.datasetItemApiFilterV2 as V2DatasetItemFilter
  const params: LoadDatasetFolderParams = {
    teamSlug,
    dataset_ids: [datasetId],
    ...filters,
    include_thumbnails: includeThumbNails === undefined ? true : includeThumbNails,
    item_paths: undefined
  }
  params.page = undefined
  params.sort = undefined

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
    commit('SET_V2_DATASET_FOLDERS', { folders: response.data.folders, datasetId })
  }

  return response
}
