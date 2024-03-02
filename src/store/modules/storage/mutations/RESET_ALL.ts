import { getInitialState } from '@/store/modules/storage/state'
import { StorageMutation } from '@/store/modules/storage/types'
import { copyAttributes } from '@/utils'

export const RESET_ALL: StorageMutation =
  state => { copyAttributes(state, getInitialState()) }
