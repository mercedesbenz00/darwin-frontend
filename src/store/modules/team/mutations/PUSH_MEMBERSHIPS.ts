import { TeamMutation } from '@/store/modules/team/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export const PUSH_MEMBERSHIPS: TeamMutation<MembershipPayload[]> = (state, data) => {
  const newIds = data.map(d => d.id)
  state.memberships = state.memberships.filter(m => !newIds.includes(m.id)).concat(data)
}
