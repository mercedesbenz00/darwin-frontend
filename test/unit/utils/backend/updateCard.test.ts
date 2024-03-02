import { buildBillingInfoSelectedSource, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { api, errorMessages } from '@/utils'
import { updateCard } from '@/utils/backend'

mockApi()

let apiPut: jest.SpyInstance

let payload: Parameters<typeof updateCard>[0]
const selectedSource = buildBillingInfoSelectedSource()

beforeEach(() => {
  apiPut = jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: { selected_source: selectedSource } }))
  payload = {
    teamId: 1,
    token: 'token'
  }
})

afterEach(() => {
  apiPut.mockReset()
})

it('sends request to backend', async () => {
  await updateCard(payload)
  expect(apiPut).toHaveBeenCalledWith('customers/1/payment_methods', {
    token: 'token'
  })
})

it('returns response from backend', async () => {
  const response = await updateCard(payload)
  expect(response).toEqual(expect.objectContaining({ data: { selected_source: selectedSource } }))
})

it('parses and returns error on backend error', async () => {
  apiPut.mockRejectedValue(backendUnauthenticatedError)

  const response = await updateCard(payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.BILLING_INFO_UPDATE[401],
      status: 401
    })
  })
})
