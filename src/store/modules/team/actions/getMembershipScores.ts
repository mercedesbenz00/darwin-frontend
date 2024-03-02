import { TeamAction } from '@/store/modules/team/types'
import { MembershipScorePayload } from '@/store/types/MembershipScorePayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export type GetMembershipScoresPayload = { datasetId: number }

/**
 * Retrieve list of scores for all members of the current team
 */
export const getMembershipScores: TeamAction<GetMembershipScoresPayload, MembershipScorePayload[]> =
  async ({ commit, state }, { datasetId }) => {
    if (!datasetId) { throw new Error('team/getMembershipScores: datasetId is missing') }
    if (!state.currentTeam) { throw new Error('team/getMembershipScores: No team selected') }

    let response

    try {
      response = await api.get(`datasets/${datasetId}/scores`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.TEAM_MEMBERS_LOAD)
    }

    const { data } = response
    commit('PUSH_MEMBERSHIP_SCORES', { data, datasetId, teamId: state.currentTeam.id })
    return { data }
  }
