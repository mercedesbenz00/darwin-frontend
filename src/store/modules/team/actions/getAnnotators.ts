import { TeamAction } from '@/store/modules/team/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { TeamPayload } from '@/store/types/TeamPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/**
 * Get list of annotator team members for current team
 */
export const getAnnotators: TeamAction<TeamPayload, MembershipPayload[]> = async ({ commit }) => {
  let response

  try {
    response = await api.get('memberships', { role: 'annotator' })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.TEAM_MEMBERS_LOAD)
  }

  const { data } = response
  commit('PUSH_MEMBERSHIPS', data)
  return { data }
}
