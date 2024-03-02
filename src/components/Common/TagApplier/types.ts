import { InputTag } from '@/store/types'

export type AddTagPayload = {
  tag: InputTag
  addTag: () => void
}

export type RemoveTagPayload = {
  tag: InputTag,
  deleteTag: () => void
}
