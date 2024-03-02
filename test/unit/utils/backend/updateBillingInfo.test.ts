import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { updateBillingInfo } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('updateBillingInfo', () => {
  it('requests to correct path', () => {
    updateBillingInfo({ teamId: 1 })
    expect(api.put).toHaveBeenCalledWith('customers/1', {})
  })

  it('requests with correct params', () => {
    updateBillingInfo({ email: 'foo', name: 'bar', teamId: 5 })
    expect(api.put).toHaveBeenCalledWith('customers/5', { email: 'foo', name: 'bar' })
  })

  it('returns data', async () => {
    jest.spyOn(api, 'put').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await updateBillingInfo({ teamId: 1 })
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const response = await updateBillingInfo({ teamId: 1 })
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
