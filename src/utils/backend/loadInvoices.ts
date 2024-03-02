import { InvoicePayload } from '@/store/modules/billing/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Simply load invoices for the specified team
 */
export const loadInvoices = async (teamId: number) => {
  const path = `customers/${teamId}/invoices`

  let response

  try {
    response = await get<InvoicePayload[]>(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.INVOICES_LOAD)
  }
  return response
}
