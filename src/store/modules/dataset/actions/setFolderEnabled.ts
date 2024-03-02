import { DatasetAction } from '@/store/modules/dataset/types'

export const setFolderEnabled: DatasetAction<boolean> = (
  { commit }, folderEnabled
) => {
  commit('SET_FOLDER_ENABLED', folderEnabled)
}
