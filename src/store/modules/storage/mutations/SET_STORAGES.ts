import Vue from 'vue'

import { StorageMutation } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'

export const SET_STORAGES: StorageMutation<StoragePayload[]> =
  (state, storages: StoragePayload[]) => {
    storages.forEach((s: StoragePayload) => {
      Vue.set(state.storages, s.slug, s)
    })
  }
