import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { api, errorMessages } from '@/utils'
import { migrateTeam } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('migrateTeam', () => {
  it('requests to correct path', () => {
    migrateTeam({ teamId: 1, feature: 'TEST_FEATURE' })
    expect(api.post).toHaveBeenCalledWith('admin/teams/1/migrate', { feature: 'TEST_FEATURE' })
  })

  it('returns data', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: 'foo' }))
    const response = await migrateTeam({ teamId: 1, feature: 'TEST_FEATURE' })
    expect(response).toEqual(expect.objectContaining({ data: 'foo' }))
  })

  it('returns error', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await migrateTeam({ teamId: 1, feature: 'TEST_FEATURE' })
    expect(response).toEqual({
      error: expect.objectContaining({
        message: errorMessages.ADMIN_TEAM_UPDATE.default,
        status: 401
      })
    })
  })
})
