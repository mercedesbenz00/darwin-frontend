import { CommentState, getInitialState } from '@/store/modules/comment/state'
import { CommentMutation } from '@/store/modules/comment/types'
import { copyAttributes } from '@/utils'

export const RESET_ALL: CommentMutation<void> = (state: CommentState) => {
  copyAttributes(state, getInitialState())
}
