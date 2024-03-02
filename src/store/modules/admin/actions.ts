import { ActionTree } from 'vuex'

import {
  RootState,
  TypedAction
} from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

import { convertTeamToPartner } from './actions/convertTeamToPartner'
import { createCredit } from './actions/createCredit'
import { createTeamFeature } from './actions/createTeamFeature'
import { createTeamOwnerInvitation } from './actions/createTeamOwnerInvitation'
import { migrateTeam } from './actions/migrateTeam'
import { syncApiKeys } from './actions/syncApiKeys'
import { updateCustomerSubscription } from './actions/updateCustomerSubscription'
import { updateTeam } from './actions/updateTeam'
import { AdminState } from './state'

type AdminActions = ActionTree<AdminState, RootState> & {
  getTeams: TypedAction<AdminState, RootState, {}>
}

// actions
export const actions: AdminActions = {
  convertTeamToPartner,
  createCredit,
  createTeamFeature,
  createTeamOwnerInvitation,
  migrateTeam,
  syncApiKeys,
  updateCustomerSubscription,
  updateTeam,
  /**
   * Fetch all teams from the backend
   */
  async getTeams ({ commit }) {
    const path = 'admin/teams'

    let response

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_TEAMS_LOAD)
    }
    const { data } = response
    commit('SET_TEAMS', data)
    return { data }
  },

  /**
   * Fetch all teams from the backend
   */
  async getTeam ({ commit }, id: number) {
    const path = `admin/teams/${id}`

    let response

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_TEAM_LOAD)
    }
    const { data } = response
    commit('PUSH_TEAM', data)
    return { data }
  },

  /**
   * Joins a team as admin
   */
  async joinTeam (store, params) {
    const path = `admin/teams/${params.id}/force_join`

    let response

    try {
      response = await api.post(path, params)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
    }
    return response
  },

  /**
   * Migrate a team to workflows
   */
  async migrateTeamToWorkflows (store, params) {
    const path = `admin/teams/${params.id}/migrate_to_workflows`

    let response

    try {
      response = await api.post(path, params)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
    }
    return response
  },

  async indexTeamFeatures ({ rootState }) {
    const currentTeam = rootState.team.currentTeam
    if (!currentTeam) { throw new Error('[admin/indexTeamFeatures]: Current team not set') }
    const path = `/teams/${currentTeam.id}/features`

    let response

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_FEATURES_LOAD)
    }
    return response
  },

  /**
   * Fetch all team owner invitations from the backend
   */
  async getTeamOwnerInvitations ({ commit }) {
    const path = 'admin/users/invitations'

    let response

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ADMIN_TEAM_OWNER_INVITATIONS_LOAD)
    }
    const { data } = response
    commit('SET_TEAM_OWNER_INVITATIONS', data)
    return { data }
  }
}
