import { ClientTeamInvitationPayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string,
  teamId: number
  neuralNetworks: boolean
}

/**
 * Allows a partner team to create a client team invitation
 */
export const createClientTeamInvitation = async (params: Params) => {
  const path = `teams/${params.teamId}/client_invitations`

  const requestParams: Pick<
    ClientTeamInvitationPayload, | 'email' | 'meta'
  > = {
    email: params.email,
    meta: {
      neural_networks: params.neuralNetworks
    }
  }

  let response

  try {
    response = await post<ClientTeamInvitationPayload>(path, requestParams)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.PARTNER_CREATE_INVITATION)
  }

  return response
}
