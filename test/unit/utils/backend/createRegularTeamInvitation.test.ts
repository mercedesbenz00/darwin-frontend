import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { TeamOwnerInvitationPayload } from '@/store/modules/admin/types'
import { api, errorMessages } from '@/utils'
import { createRegularTeamInvitation } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createRegularTeamInvitation>[0]

const response: TeamOwnerInvitationPayload = {
  id: 5,
  email: 'foo@example.com',
  team: null,
  credit_amount: 20,
  credit_expiration_in_days: 14
}

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: response }))
  payload = {
    email: 'foo@example.com',
    creditAmount: 15,
    creditExpirationInDays: 8
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createRegularTeamInvitation(payload)
  expect(apiPost).toHaveBeenCalledWith('admin/users/invitations', {
    email: payload.email,
    credit_amount: 15,
    credit_expiration_in_days: 8
  })
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createRegularTeamInvitation(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ADMIN_TEAM_OWNER_INVITATIONS_CREATE[401],
      status: 401
    })
  })
})
