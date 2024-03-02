import { StorageMutation } from '@/store/modules/storage/types'

export const SET_STORAGE_AS_DEFAULT: StorageMutation<string> =
  (state, slug: string) => {
    Object.keys(state.storages).forEach((s: string) => {
      state.storages[s].default = false
    })

    state.storages[slug].default = true
  }
