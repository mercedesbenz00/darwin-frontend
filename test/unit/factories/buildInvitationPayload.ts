import { InvitationPayload } from '@/store/types'

import { buildTeamPayload } from './buildTeamPayload'
import { buildUserPayload } from './buildUserPayload'

type Params = Partial<InvitationPayload>

export const buildInvitationPayload = (params: Params): InvitationPayload => ({
  id: -1,
  team_id: -1,
  confirmed: false,
  email: 'unset@mail.com',
  role: 'annotator',
  team: buildTeamPayload({ id: -1 }),
  user: buildUserPayload({ id: -1 }),
  ...params
})
