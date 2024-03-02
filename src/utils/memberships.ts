import { MembershipPayload, MembershipRole } from '@/store/types'

const ROLE_PRIORITY: { [key in MembershipRole]: number } = {
  annotator: 1,
  member: 2,
  workforce_manager: 3,
  owner: 4,
  admin: 5
}

export const getHighestRole = (memberships: MembershipPayload[]): MembershipRole => {
  if (memberships.length === 0) {
    throw new Error('You should have at least one role in the team')
  }

  memberships.sort((a, b) => {
    if (ROLE_PRIORITY[a.role] > ROLE_PRIORITY[b.role]) { return -1 }
    if (ROLE_PRIORITY[a.role] < ROLE_PRIORITY[b.role]) { return 1 }
    return 0
  })

  return memberships[0].role
}
