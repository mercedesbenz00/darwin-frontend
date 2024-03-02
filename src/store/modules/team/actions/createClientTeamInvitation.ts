import { TeamAction } from '@/store/modules/team/types'
import { ClientTeamInvitationPayload } from '@/store/types/ClientTeamInvitationPayload'
import { ParsedValidationError } from '@/utils'
import { createClientTeamInvitation as request } from '@/utils/backend'

type Payload = {
  email: string
  neuralNetworks: boolean
}

type Action = TeamAction<Payload, ClientTeamInvitationPayload>

/**
 * Allows a partner team to create a new client team invitation and pushes it to
 * the store.
 */
export const createClientTeamInvitation: Action = async ({ commit, state }, payload) => {
  const { email, neuralNetworks } = payload

  if (!email) {
    const error: ParsedValidationError = {
      isValidationError: true,
      errors: {
        email: 'You must specify an email'
      }
    }

    return { error }
  }

  if (!state.currentTeam) {
    throw new Error('[team/createClientTeamInvitation]: No current team set.')
  }

  const teamId = state.currentTeam.id
  const response = await request({ email, neuralNetworks, teamId })

  if ('data' in response) {
    commit('PUSH_CLIENT_TEAM_INVITATION', response.data)
  }

  return response
}
