import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateTeamAsAdmin } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateTeamAsAdmin>[0]

beforeEach(() => {
  payload = {
    note: 'lorem ipsum',
    disabled: true,
    neural_models_enabled: false,
    managed_status: 'partner',
    teamId: 5,
    name: 'V8',
    slug: 'v8'
  }
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: payload }))
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateTeamAsAdmin(payload)
  expect(apiPut).toHaveBeenCalledWith('admin/teams/5', {
    note: 'lorem ipsum',
    disabled: true,
    neural_models_enabled: false,
    managed_status: 'partner',
    name: 'V8',
    slug: 'v8'
  })
})

it('returns response from backend', async () => {
  const response = await updateTeamAsAdmin(payload)
  expect(response).toEqual(expect.objectContaining({ data: payload }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateTeamAsAdmin(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.ADMIN_TEAM_UPDATE.default,
      status: 401
    })
  })
})
