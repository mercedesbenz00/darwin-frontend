import { ActionTree } from 'vuex'

import { StorageState } from '@/store/modules/storage/state'
import { RootState } from '@/store/types'

import { addStorage } from './addStorage'
import { deleteStorage } from './deleteStorage'
import { getStorages } from './getStorages'
import { setStorageAsDefault } from './setStorageAsDefault'
import { updateStorage } from './updateStorage'

const actions: ActionTree<StorageState, RootState> = {
  addStorage,
  deleteStorage,
  getStorages,
  setStorageAsDefault,
  updateStorage
}

export default actions
