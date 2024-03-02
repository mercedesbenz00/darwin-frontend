import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { syncApiKeys } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('syncApiKeys', () => {
  it('requests to correct path', async () => {
    await syncApiKeys()
    expect(api.post).toHaveBeenCalledWith('admin/sync_api_keys')
  })

  it('returns data', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await syncApiKeys()
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await syncApiKeys()
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
