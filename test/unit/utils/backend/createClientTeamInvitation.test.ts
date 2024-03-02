import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { ClientTeamInvitationPayload } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { createClientTeamInvitation } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createClientTeamInvitation>[0]

const response: ClientTeamInvitationPayload = {
  id: 5,
  email: 'foo@example.com',
  team: null,
  credit_amount: 20,
  credit_expiration_in_days: 14,
  partner_team_id: 7,
  meta: { neural_networks: true }
}

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: response }))
  payload = {
    email: 'foo@example.com',
    teamId: 7,
    neuralNetworks: true
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createClientTeamInvitation(payload)
  expect(apiPost).toHaveBeenCalledWith('teams/7/client_invitations', {
    email: payload.email,
    meta: { neural_networks: payload.neuralNetworks }
  })
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createClientTeamInvitation(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.PARTNER_CREATE_INVITATION[401],
      status: 401
    })
  })
})
