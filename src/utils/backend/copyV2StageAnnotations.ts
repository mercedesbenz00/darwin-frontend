import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string,
  itemId: string,
  targetItemId: string,
  workPhase: string
}

/**
 * Copies stage annotations from one stage to another
 */
export const copyV2StageAnnotations = async ({
  teamSlug,
  itemId,
  targetItemId,
  workPhase
}: Params) => {
  const path = `/v2/teams/${teamSlug}/items/${itemId}/annotations/copy`
  try {
    const response = await post(path, {
      target_item_id: targetItemId,
      work_phase: workPhase
    })

    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_ANNOTATE)
  }
}
