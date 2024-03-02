import { MembershipRole } from '@/store/types'

export type RoleDropdownOption = {
  description: string
  id: MembershipRole
  priority: number
  text: string
}
