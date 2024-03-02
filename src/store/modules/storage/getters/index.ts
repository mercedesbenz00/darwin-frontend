import { GetterTree } from 'vuex'

import { StorageState } from '@/store/modules/storage/state'
import { RootState } from '@/store/types'

import { storages } from './storages'

const getters: GetterTree<StorageState, RootState> = {
  storages
}

export default getters
