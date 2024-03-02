import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'
import { treeify } from '@/utils'

type Payload = {
  folders: DatasetFolderPayload[]
  datasetId: number
}

export const SET_DATASET_FOLDERS: DatasetMutation<Payload> = (state, payload) => {
  const { folders, datasetId } = payload
  const filteredFolders = folders.filter(folder => folder.direct_item_count_filtered > 0)
  state.datasetFolders = folders
  state.datasetTreefiedFolders = treeify(filteredFolders, datasetId)
}
