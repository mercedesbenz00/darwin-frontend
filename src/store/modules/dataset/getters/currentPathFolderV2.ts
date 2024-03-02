import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'

// Treeified direct subfolders under the current path
export const currentPathFolderV2: Getter<DatasetState, RootState> =
  (state, getters): V2DatasetFolderPayload | null => {
    const { currentPathV2 } = getters
    const { datasetTreefiedFoldersV2 } = state
    if (!currentPathV2) { return null }

    let currentPathFolder: V2DatasetFolderPayload | undefined = datasetTreefiedFoldersV2[0]
    while (currentPathFolder) {
      if (currentPathFolder.path === currentPathV2) { return currentPathFolder }
      if (!currentPathFolder.children || currentPathFolder.children.length === 0) { return null }

      currentPathFolder = currentPathFolder.children.find(
        folder => folder.path === currentPathV2 || currentPathV2.startsWith(folder.path + '/')
      )
    }
    return currentPathFolder || null
  }
