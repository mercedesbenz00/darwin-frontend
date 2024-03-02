import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetFolderPayload } from '@/store/types/DatasetFolderPayload'

// list of non-treefied dataset folders under the current folder
export const currentPathFolders: Getter<DatasetState, RootState> =
  (state, getters): DatasetFolderPayload[] => {
    const { currentPath } = getters
    const { datasetFolders } = state
    if (!currentPath) { return [] }

    return datasetFolders.filter(folder => folder.path.startsWith(currentPath))
  }
