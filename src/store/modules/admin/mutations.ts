import { MutationTree } from 'vuex'

import { AnnotationCreditPayload } from '@/store/types/AnnotationCreditPayload'
import { FeaturePayload } from '@/store/types/FeaturePayload'

import { PUSH_TEAM } from './mutations/PUSH_TEAM'
import { AdminState } from './state'
import { TeamPayload, TeamOwnerInvitationPayload, AdminMutation } from './types'
import { normalizeTeamOwnerInvitation } from './utils'

const SET_TEAMS: AdminMutation<TeamPayload[]> = (state, data: TeamPayload[]) => {
  state.teams = data
}

type PushTeamFeature = AdminMutation<{teamId: number, feature: FeaturePayload['name']}>

const PUSH_TEAM_FEATURE: PushTeamFeature = (state, { teamId, feature }) => {
  const team = state.teams.find(t => t.id === teamId)
  if (!team) { return }
  team.features.push(feature)
}

const PUSH_ANNOTATION_CREDIT: AdminMutation<AnnotationCreditPayload> = (state, data) => {
  const index = state.annotationCredits.findIndex(t => t.id === data.id)

  if (index === -1) {
    state.annotationCredits.push(data)

    // update billed amount for team
    const team = state.teams.find(t => t.id === data.team_id)
    if (!team) { return }
    team.customer_v3.customer_subscription.annotation_credits_bonus += data.amount_billed / 3600
  } else {
    state.annotationCredits.splice(index, 1, data)
  }
}

const SET_TEAM_OWNER_INVITATIONS: AdminMutation<TeamOwnerInvitationPayload[]> = (state, data) => {
  state.teamOwnerInvitations = data.map(normalizeTeamOwnerInvitation)
}

const PUSH_TEAM_OWNER_INVITATION: AdminMutation<TeamOwnerInvitationPayload> = (state, data) => {
  const teamOwnerInvitation = normalizeTeamOwnerInvitation(data)
  state.teamOwnerInvitations.push(teamOwnerInvitation)
}

// mutations
export const mutations: MutationTree<AdminState> = {
  SET_TEAMS,
  PUSH_TEAM,
  PUSH_TEAM_FEATURE,

  /**
   * Add new bonus credit record to the store.
   *
   * Bonus credits get added to the customer's subscription.
   *
   * However, their usage and expiration are tracked individually, so they
   * are created as separate records.
   */
  PUSH_ANNOTATION_CREDIT,
  SET_TEAM_OWNER_INVITATIONS,
  PUSH_TEAM_OWNER_INVITATION
}
