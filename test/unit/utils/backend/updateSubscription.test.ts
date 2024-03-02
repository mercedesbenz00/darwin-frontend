import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { updateSubscription } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('updateSubscription', () => {
  it('requests to correct path', () => {
    updateSubscription({ teamId: 1 })
    expect(api.put).toHaveBeenCalledWith('customers/1/subscription', {})
  })

  it('requests with correct params', () => {
    updateSubscription({
      annotation_credits_standard: 100,
      storage_standard: 500,
      teamId: 1
    })

    expect(api.put).toHaveBeenCalledWith('customers/1/subscription', {
      annotation_credits_standard: 100,
      storage_standard: 500
    })
  })

  it('returns data', async () => {
    jest.spyOn(api, 'put').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await updateSubscription({ teamId: 1 })
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const response = await updateSubscription({ teamId: 1 })
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
