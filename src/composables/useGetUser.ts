import { useStore } from '@/composables'
import { MembershipPayload } from '@/store/types'

type GetUserType = {
   getUser: (teamId: number, userId: number) => MembershipPayload | null
   getUserFullName: (user: MembershipPayload) => string
   getUserAvatar: (user: MembershipPayload) => string
}

export const useGetUser = (): GetUserType => {
  const { getters } = useStore()

  const getUser = getters['team/findMembershipByTeamIdUserId']

  return {
    getUser,
    getUserFullName: (user) => `${user?.first_name} ${user?.last_name}`,
    getUserAvatar: (user) => (user.image && (user.image.thumbnail_url || user.image.url)) || ''
  }
}
