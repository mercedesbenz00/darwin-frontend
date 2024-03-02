import { DatasetMutation } from '@/store/modules/dataset/types'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'
import { treeifyV2 } from '@/utils'

type Payload = {
  folders: V2DatasetFolderPayload[]
  datasetId: number
}

export const SET_V2_DATASET_FOLDERS: DatasetMutation<Payload> = (state, payload) => {
  const { folders, datasetId } = payload
  const filteredFolders = folders.filter(folder => folder.filtered_item_count > 0)
  state.datasetFoldersV2 = folders
  state.datasetTreefiedFoldersV2 = treeifyV2(filteredFolders, datasetId)
}
