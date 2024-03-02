import { BillingInfoPayload } from '@/store/modules/billing/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  teamId: number
  token: string
}

type BackendParams = Omit<Params, 'teamId'>

export const updateCard = async (params: Params) => {
  const path = `customers/${params.teamId}/payment_methods`
  const requestParams: BackendParams = {
    token: params.token
  }

  try {
    const response = await put<Pick<BillingInfoPayload, 'selected_source'>>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.BILLING_INFO_UPDATE)
  }
}
