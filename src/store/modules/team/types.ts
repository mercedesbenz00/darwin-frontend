import { RootState, TeamPayload, TypedAction, TypedMutation } from '@/store/types'

import { TeamState } from './state'

export type RegisterTeamParams = {
  content: Blob
  hash: string
  name: string
  type: string
}

export type TeamWithAvatarUploadParams = TeamPayload & {
  image: {
    url: string
    // eslint-disable-next-line camelcase
    upload_url: string
  }
}

export type TeamAction<T, R = any> = TypedAction<TeamState, RootState, T, R>
export type TeamMutation<R = any> = TypedMutation<TeamState, R>
