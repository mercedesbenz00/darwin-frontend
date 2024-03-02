import { CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

type Params = {
  /* eslint-disable camelcase */
  credits?: number
  storage?: number
  teamSlug: string
  /* eslint-enable camelcase */
}

/**
 * Primarily used by a partner team, to set an explicit credit or storage limit
 * on one of their client teams.
 *
 * The backend actually supports setting both limits at the same time, but
 * generally speaking, a user will only be updating one at a time through the UI.
 */
export const updateTeamUsageLimit = async (params: Params) => {
  const { teamSlug } = params
  const requestParams: Partial<
    Pick<CustomerSubscriptionPayload, 'annotation_credits_standard' | 'storage_standard'>
  > = {}

  if ('credits' in params) {
    requestParams.annotation_credits_standard = params.credits
  }

  if ('storage' in params) {
    requestParams.storage_standard = params.storage
  }

  const path = `teams/${teamSlug}/billing/usage`

  try {
    const response = await put<CustomerSubscriptionPayload>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.TEAM_UPDATE)
  }
}
