import { buildInvoicePayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { backendUnauthenticatedError } from 'test/unit/responseStubs'

import { InvoicePayload } from '@/store/modules/billing/types'
import { api, errorMessages } from '@/utils'
import { loadInvoices } from '@/utils/backend'

mockApi()

let apiGet: jest.SpyInstance

let params: Parameters<typeof loadInvoices>[0]
let invoices: InvoicePayload[]

beforeEach(() => {
  invoices = [buildInvoicePayload({})]
  apiGet = jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: invoices }))
  params = 1
})

afterEach(() => {
  apiGet.mockReset()
})

it('requests auth from backend', async () => {
  await loadInvoices(params)
  expect(apiGet).toHaveBeenCalledWith('customers/1/invoices')
})

it('returns response from backend', async () => {
  const response = await loadInvoices(params)
  expect(response).toEqual(expect.objectContaining({ data: invoices }))
})

it('parses and returns error on backend error', async () => {
  apiGet.mockRejectedValue(backendUnauthenticatedError)

  const response = await loadInvoices(params)

  expect(response).toEqual({
    error: expect.objectContaining({
      message: errorMessages.INVOICES_LOAD[401],
      status: 401
    })
  })
})
