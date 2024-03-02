import { MembershipPayload } from '@/store/types/MembershipPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

/* eslint-disable camelcase */
type Params = { teamId: number } | { teamSlug: string }
/* eslint-enable camelcase */

const resolvePath = (params: Params): string => {
  if ('teamId' in params) { return `teams/${params.teamId}/memberships` }
  if ('teamSlug' in params) { return `teams/${params.teamSlug}/memberships` }
  throw new Error('A team id or slug is necessary to load memberships for a team')
}

/**
 * Get the list of team members for the specified team
 */
export const loadTeamMemberships = async (params: Params) => {
  const path = resolvePath(params)

  try {
    const response = await api.get<MembershipPayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.TEAM_MEMBERS_LOAD)
  }
}
