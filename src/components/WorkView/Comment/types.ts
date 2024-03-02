import { CommentThread, View } from '@/engine/models'
import { UserPayload } from '@/store/types'
import { V2CommentPayload } from '@/store/types'

export type CommentThreadIconProps = {
  commentThread: CommentThread
  view: View
}

export type ReplyBoxProps = {
  author: UserPayload
  stickAuthor?: boolean
  comment?: V2CommentPayload
}
