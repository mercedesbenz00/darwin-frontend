import { GetterTree } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'

import { currentTeamClientInvitations } from './currentTeamClientInvitations'
import { currentTeamInvitations } from './currentTeamInvitations'
import { findMembershipByTeamIdUserId } from './findMembershipByTeamIdUserId'
import { findMembershipInRelevantTeamsByUserId } from './findMembershipInRelevantTeamsByUserId'
import { getScoreInCurrentTeam } from './getScoreInCurrentTeam'
import { getScoreInDataset } from './getScoreInDataset'
import { membershipsForTeam } from './membershipsForTeam'
import { relevantTeamMemberships } from './relevantTeamMemberships'

export const getters: GetterTree<TeamState, RootState> = {
  currentTeamClientInvitations,
  currentTeamInvitations,
  findMembershipByTeamIdUserId,
  findMembershipInRelevantTeamsByUserId,
  getScoreInCurrentTeam,
  getScoreInDataset,
  membershipsForTeam,
  relevantTeamMemberships
}
