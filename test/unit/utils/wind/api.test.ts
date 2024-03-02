import { buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { api } from '@/utils'
import { CreateWindAuthParams, WindAuthAction } from '@/utils/backend'
import { resolveWindAuth } from '@/utils/wind/api'

mockApi()

let authParams: CreateWindAuthParams

let apiPost: jest.SpyInstance

describe('resolveWindAuth', () => {
  beforeEach(() => {
    authParams = {
      action: WindAuthAction.ViewModels,
      teamId: 123
    }
  })

  it('uses cached data by default', async () => {
    sessionStorage.setItem('view_models:123', 'a.good')

    const windAuth = await resolveWindAuth(authParams)

    expect(windAuth).toEqual(expect.objectContaining({ data: { token: 'a.good' } }))
  })

  it('requests auth from backend when not cached', async () => {
    apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: { token: 'a.good' } }))

    await resolveWindAuth(authParams, false)

    expect(apiPost).toHaveBeenCalledWith('teams/123/wind_auth', { action: 'view_models' })
  })

  it('requests auth from backend', async () => {
    apiPost = jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: { token: 'a.good' } }))

    const windAuth = await resolveWindAuth(authParams, false)

    expect(windAuth).toEqual(expect.objectContaining({ data: { token: 'a.good' } }))
  })
})
