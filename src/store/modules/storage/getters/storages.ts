import { Getter } from 'vuex'

import { StorageState } from '@/store/modules/storage/state'
import { RootState } from '@/store/types'
import { StoragePayload } from '@/store/types/StoragePayload'

export const storages: Getter<StorageState, RootState> =
  (state): StoragePayload[] => {
    let storages = Object.keys(state.storages).map((k: string) => state.storages[k])
    const defaultStorage = storages.find((item: StoragePayload) => item.default === true)
    if (defaultStorage) {
      storages = [
        defaultStorage,
        ...storages.filter((item: StoragePayload) => item.default !== true)
      ]
    }
    return storages
  }
