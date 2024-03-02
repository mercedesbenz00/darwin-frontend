import { buildBillingInfoPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { BillingInfoPayload } from '@/store/modules/billing/types'
import { api, errorMessages } from '@/utils'
import { loadBillingInfo } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let params: Parameters<typeof loadBillingInfo>[0]
let billingInfo: BillingInfoPayload

beforeEach(() => {
  billingInfo = buildBillingInfoPayload({})
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: billingInfo }))
  params = 1
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadBillingInfo(params)
  expect(apiGet).toHaveBeenCalledWith('customers/1')
})

it('returns response from backend', async () => {
  const response = await loadBillingInfo(params)
  expect(response).toEqual(expect.objectContaining({ data: billingInfo }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadBillingInfo(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.BILLING_INFO_LOAD[401],
      status: 401
    })
  })
})
