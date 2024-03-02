import { ImagePayload } from '@/store/types/ImagePayload'

import { MembershipRole } from './MembershipRole'

/* eslint-disable camelcase */

export type MembershipPayload = {
  id: number
  user_id: number
  team_id: number
  role: MembershipRole
  // TODO: move user fields to either async fetch, or submap
  email: string
  first_name: string
  last_name: string
  // TODO: move image fields to async fetch
  image: Pick<ImagePayload, 'id' | 'url' | 'thumbnail_url'> | null
  // Load using team/getMembershipScores
  score?: number
  /* eslint-enable camelcase */
}
