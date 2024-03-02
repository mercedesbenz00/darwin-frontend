import { ActionTree } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'

import { addInvitations } from './addInvitations'
import { createClientTeamInvitation } from './createClientTeamInvitation'
import { deleteInvitation } from './deleteInvitation'
import { deleteMembership } from './deleteMembership'
import { deleteTeam } from './deleteTeam'
import { getInvitations } from './getInvitations'
import { getMembershipScores } from './getMembershipScores'
import { getMemberships } from './getMemberships'
import { getPartnerMemberships } from './getPartnerMemberships'
import { getTeam } from './getTeam'
import { leaveTeam } from './leaveTeam'
import { register } from './register'
import { resolveImageUrl } from './resolveImageUrl'
import { updateInvitation } from './updateInvitation'
import { updateMembership } from './updateMembership'
import { updateTeam } from './updateTeam'

export const actions: ActionTree<TeamState, RootState> = {
  addInvitations,
  createClientTeamInvitation,
  deleteInvitation,
  deleteMembership,
  deleteTeam,
  getInvitations,
  getMemberships,
  getMembershipScores,
  getPartnerMemberships,
  getTeam,
  leaveTeam,
  register,
  resolveImageUrl,
  updateInvitation,
  updateMembership,
  updateTeam
}
