import Vue from 'vue'

import { StorageMutation } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'

export const SET_STORAGE: StorageMutation<StoragePayload> =
  (state, storage: StoragePayload) => {
    Vue.set(state.storages, storage.slug, storage)
  }
