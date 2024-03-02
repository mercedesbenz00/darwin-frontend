import { MutationTree } from 'vuex'

import { StorageState } from '@/store/modules/storage/state'

import { DELETE_STORAGE } from './DELETE_STORAGE'
import { RESET_ALL } from './RESET_ALL'
import { SET_STORAGE } from './SET_STORAGE'
import { SET_STORAGES } from './SET_STORAGES'
import { SET_STORAGE_AS_DEFAULT } from './SET_STORAGE_AS_DEFAULT'

const mutations: MutationTree<StorageState> = {
  SET_STORAGES,
  SET_STORAGE,
  SET_STORAGE_AS_DEFAULT,
  DELETE_STORAGE,
  RESET_ALL
}

export default mutations
