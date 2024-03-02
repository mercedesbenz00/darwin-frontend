import { AdminAction, TeamPayload } from '@/store/modules/admin/types'
import { ApiResponse, AnnotationCreditPayload } from '@/store/types'
import { parseError, errorMessages, api, isErrorResponse } from '@/utils'

type Payload = {
  amountBilled: number
  expiresAt: string
  note: string | null
  team: TeamPayload
}

type CreateCredit = AdminAction<Payload, any>

export const createCredit: CreateCredit = async (
  { commit },
  { amountBilled, expiresAt, note, team }
) => {
  const path = `admin/teams/${team.id}/annotation_credits`
  const params = {
    amount_billed: amountBilled,
    expires_at: expiresAt,
    note: note
  }

  let response: ApiResponse<{ data: AnnotationCreditPayload }>

  try {
    response = await api.post(path, params)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_ANNOTATION_CREDIT_CREATE)
  }

  const { data } = response
  commit('PUSH_ANNOTATION_CREDIT', data)
  return { data }
}
