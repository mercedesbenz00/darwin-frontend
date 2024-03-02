import { buildCreditUsagePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { CreditUsagePayload } from '@/store/types'
import { api, errorMessages } from '@/utils'
import { loadCreditUsage } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let params: Parameters<typeof loadCreditUsage>[0]
let creditUsage: CreditUsagePayload

beforeEach(() => {
  creditUsage = buildCreditUsagePayload()
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: creditUsage }))
  params = {
    teamSlug: 'v7',
    type: 'annotation_credits'
  }
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadCreditUsage(params)
  expect(apiGet).toHaveBeenCalledWith('v7/billing/usage/annotation_credits/current')
})

it('returns response from backend', async () => {
  const response = await loadCreditUsage(params)
  expect(response).toEqual(expect.objectContaining({ data: creditUsage }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadCreditUsage(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.CREDIT_USAGE_LOAD[401],
      status: 401
    })
  })
})
