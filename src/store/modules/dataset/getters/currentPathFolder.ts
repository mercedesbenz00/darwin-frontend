import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'

// Treeified direct subfolders under the current path
export const currentPathFolder: Getter<DatasetState, RootState> =
  (state, getters): DatasetFolderPayload | null => {
    const { currentPath } = getters
    const { datasetTreefiedFolders } = state
    if (!currentPath) { return null }

    let currentPathFolder: DatasetFolderPayload | undefined = datasetTreefiedFolders[0]
    while (currentPathFolder) {
      if (currentPathFolder.path === currentPath) { return currentPathFolder }
      if (!currentPathFolder.children || currentPathFolder.children.length === 0) { return null }

      currentPathFolder = currentPathFolder.children.find(
        folder => folder.path === currentPath || currentPath.startsWith(folder.path + '/')
      )
    }
    return currentPathFolder || null
  }
