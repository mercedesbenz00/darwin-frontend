import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { createTeamFeature } from '@/utils/backend'

mockApi()

let apiPost: jest.SpyInstance

let payload: Parameters<typeof createTeamFeature>[0]

beforeEach(() => {
  apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: '' }))
  payload = {
    feature: 'TEST_FEATURE',
    teamId: 7
  }
})

afterEach(() => {
  apiPost.mockReset()
})

it('sends request to backend', async () => {
  await createTeamFeature(payload)
  expect(apiPost).toHaveBeenCalledWith('teams/7/features/TEST_FEATURE')
})

it('parses and returns error on backend error', async () => {
  apiPost.mockRejectedValue(backendUnauthenticatedError)

  const response = await createTeamFeature(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ADMIN_TEAM_UPDATE.default,
      status: 401
    })
  })
})
