import Vue from 'vue'

import { StorageMutation } from '@/store/modules/storage/types'

export const DELETE_STORAGE: StorageMutation<string> =
  (state, slug: string) => {
    Vue.delete(state.storages, slug)
  }
