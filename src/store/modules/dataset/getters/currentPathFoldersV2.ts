import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { V2DatasetFolderPayload } from '@/store/types/V2DatasetFolderPayload'

// list of non-treefied dataset folders under the current folder
export const currentPathFoldersV2: Getter<DatasetState, RootState> =
  (state, getters): V2DatasetFolderPayload[] => {
    const { currentPathV2 } = getters
    const { datasetFoldersV2 } = state
    if (!currentPathV2) { return [] }

    return datasetFoldersV2.filter(folder => folder.path.startsWith(currentPathV2))
  }
