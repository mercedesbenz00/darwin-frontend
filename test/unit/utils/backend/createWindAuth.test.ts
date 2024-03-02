import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import {
  createWindAuth,
  WindAuthAction
} from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('createWindAuth', () => {
  const action = WindAuthAction.RunInference
  it('requests to correct path', async () => {
    await createWindAuth({ action, teamId: 1 })
    expect(api.post).toHaveBeenCalledWith('teams/1/wind_auth', { action })
  })

  it('returns data', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await createWindAuth({ action, teamId: 1 })
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await createWindAuth({ action, teamId: 1 })
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
