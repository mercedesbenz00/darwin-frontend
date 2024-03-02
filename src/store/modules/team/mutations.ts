import Vue from 'vue'
import { MutationTree } from 'vuex'

import {
  InvitationPayload,
  MembershipPayload,
  MembershipScorePayload,
  TeamPayload
} from '@/store/types'
import { copyAttributes } from '@/utils'

import { PUSH_CLIENT_TEAM_INVITATION } from './mutations/PUSH_CLIENT_TEAM_INVITATION'
import { PUSH_MEMBERSHIPS } from './mutations/PUSH_MEMBERSHIPS'
import { TeamState, getInitialState } from './state'

const mutations: MutationTree<TeamState> = {
  PUSH_CLIENT_TEAM_INVITATION,
  PUSH_MEMBERSHIPS,
  SET_CURRENT_TEAM (state, payload?: TeamPayload) {
    state.currentTeam = payload || null
  },

  PUSH_TEAM (state, team: TeamPayload) {
    const index = state.teams.findIndex(t => t.id === team.id)
    if (index > -1) {
      state.teams.splice(index, 1, team)
    } else {
      state.teams.push(team)
    }
  },

  SET_TEAMS (state, teams: TeamPayload[]) {
    state.teams = teams
  },

  SET_TEAM_AVATAR_URL (state, url: string) {
    if (!state.currentTeam) { return }
    if (!state.currentTeam.image) { return }
    Vue.set(state.currentTeam.image, 'url', url)
  },

  REMOVE_TEAM (state, team: TeamPayload) {
    const { teams } = state
    const index = teams.findIndex(t => t.id === team.id)
    if (index > -1) {
      const newTeams = [...teams]
      newTeams.splice(index, 1)
      state.teams = newTeams
    }
  },

  UNSET_CURRENT_TEAM (state) {
    state.currentTeam = null
  },

  SET_INVITATIONS (state, invitations: InvitationPayload[]) {
    state.invitations = invitations
  },

  ADD_INVITATION (state, invitation: InvitationPayload) {
    if (!state.currentTeam) { return }
    state.invitations.push(invitation)
  },

  PUSH_INVITATIONS (state, invitations: InvitationPayload[]) {
    invitations.forEach(item => {
      const index = state.invitations.findIndex(m => m.id === item.id)
      if (index > -1) {
        Vue.set(state.invitations, index, item)
      } else {
        state.invitations.push(item)
      }
    })
  },

  UPDATE_INVITATION (state, invitation: InvitationPayload) {
    if (!state.currentTeam) { return }
    const index = state.invitations.findIndex(i => i.id === invitation.id)
    if (index >= 0) { state.invitations.splice(index, 1, invitation) }
  },

  DELETE_INVITATION (state, invitationId: number) {
    if (!state.currentTeam) { return }
    const index = state.invitations.findIndex(i => i.id === invitationId)
    if (index >= 0) { state.invitations.splice(index, 1) }
  },

  SET_MEMBERSHIPS (state, data: MembershipPayload[]) {
    state.memberships = data
  },

  PUSH_MEMBERSHIP_SCORES (
    state,
    payload: { data: MembershipScorePayload[], datasetId: number, teamId: number }
  ) {
    const { data, datasetId, teamId } = payload
    const scoresForDataset = { ...state.scoresByDataset[datasetId] }
    const scoresForTeam = { ...state.scoresByTeam[teamId] }

    data.forEach(s => {
      scoresForDataset[s.id] = {
        mergedInstances: s.dataset.merged_instances,
        rejectedInstances: s.dataset.rejected_instances,
        score: s.dataset.score
      }

      scoresForTeam[s.id] = {
        mergedInstances: s.team.merged_instances,
        rejectedInstances: s.team.rejected_instances,
        score: s.team.score
      }
    })

    Vue.set(state.scoresByDataset, datasetId, scoresForDataset)
    Vue.set(state.scoresByTeam, teamId, scoresForTeam)
  },

  UPDATE_MEMBERSHIP (state, member: MembershipPayload) {
    const { memberships } = state
    const index = memberships.findIndex(m => m.id === member.id)
    if (index >= 0) { memberships.splice(index, 1, member) }
  },

  DELETE_MEMBERSHIP (state, memberId: number) {
    const { memberships } = state
    const index = memberships.findIndex(m => m.id === memberId)
    if (index >= 0) { memberships.splice(index, 1) }
  },

  // TODO: Define AuthPayload/ProfilePayload/UserPayload
  SET_MEMBER_AVATAR_URL (state, user: { id: number, image: {} }) {
    const index = state.memberships.findIndex(m => m.user_id === user.id)
    if (index >= 0) { Vue.set(state.memberships[index], 'image', user.image) }
  },

  RESET_ALL (state: TeamState) {
    copyAttributes(state, getInitialState())
  }
}

export default mutations
