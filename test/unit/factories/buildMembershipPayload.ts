import { MembershipPayload } from '@/store/types'

type MembershipPayloadBuildParams = Partial<MembershipPayload>

export const buildMembershipPayload = (params: MembershipPayloadBuildParams = {}): MembershipPayload => ({
  id: -1,
  user_id: 1,
  team_id: 1,
  role: 'member',
  first_name: '',
  last_name: '',
  email: '',
  image: { id: -1, url: '', thumbnail_url: '' },
  ...params
})
