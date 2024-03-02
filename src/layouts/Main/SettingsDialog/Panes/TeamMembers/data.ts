import { RoleDropdownOption } from '@/components/Common/RoleDropdownOption'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { MembershipRole } from '@/store/types'

export const ROLE_LABELS: { [k in MembershipRole]: string } = {
  admin: 'Admin',
  annotator: 'Worker',
  member: 'User',
  owner: 'Owner',
  workforce_manager: 'Workforce Manager'
}

export const ROLE_OPTIONS: RoleDropdownOption[] = [
  {
    id: 'annotator',
    priority: 5,
    text: 'Worker',
    description: 'Can only request tasks, comment on, and annotate images.'
  },
  {
    id: 'workforce_manager',
    priority: 4,
    text: 'Workforce Manager',
    description: [
      'Can invite annotators, view datasets they’re part of, assign & review tasks.',
      'They cannot see users without access to their datasets.'
    ].join(' ')
  },
  {
    id: 'member',
    priority: 3,
    text: 'User',
    description: 'Cannot delete others’ datasets or change team settings.'
  },
  {
    id: 'admin',
    priority: 2,
    text: 'Admin',
    description: 'Can delete any dataset, remove users, and modify team settings.'
  },
  {
    id: 'owner',
    priority: 1,
    text: 'Team Owner',
    description: 'Can change billing and plan settings.'
  }
]

export const ROLE_ORDER: Record< MembershipRole, number> = {
  annotator: 5,
  workforce_manager: 4,
  member: 3,
  admin: 2,
  owner: 1
}

export const invitationRoleOptions = ($can: IsAuthorized): RoleDropdownOption[] => {
  const rolesUserCanCreate: MembershipRole[] = []
  const allRoles: MembershipRole[] = ['annotator', 'member', 'admin', 'workforce_manager']

  allRoles.forEach(role => {
    if ($can('manage_invitations', { subject: 'invitation', resource: { role } })) {
      rolesUserCanCreate.push(role)
    }
  })

  return ROLE_OPTIONS.filter(r => rolesUserCanCreate.includes(r.id))
}

export const membershipRoleOptions = ($can: IsAuthorized): RoleDropdownOption[] => {
  const rolesUserCanUpdateTo: MembershipRole[] = []
  const allRoles: MembershipRole[] = ['annotator', 'member', 'admin', 'workforce_manager']

  allRoles.forEach(role => {
    if ($can('update_membership', { subject: 'membership', resource: { role } })) {
      rolesUserCanUpdateTo.push(role)
    }
  })

  if ($can('transfer_team_ownership')) {
    rolesUserCanUpdateTo.push('owner')
  }

  return ROLE_OPTIONS.filter(r => rolesUserCanUpdateTo.includes(r.id))
}
