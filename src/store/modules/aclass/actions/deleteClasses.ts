import { REMOVE_CLASSES } from '@/store/modules/aclass/mutations/REMOVE_CLASSES'
import { AClassAction } from '@/store/modules/aclass/types'
import { StoreMutationPayload } from '@/store/types'
import {
  api,
  errorMessages,
  isErrorResponse,
  parseError
} from '@/utils'

type DeleteClasses = AClassAction<{
  annotationClassIds: number[],
  annotationsToDeleteCount: number,
  teamId: number
}>

/**
 * Delete annotation classes specified by a list of ids
 */
export const deleteClasses: DeleteClasses = async ({ commit }, params) => {
  let response

  try {
    response = await api.remove(`teams/${params.teamId}/delete_classes`, {
      annotation_class_ids: params.annotationClassIds,
      annotations_to_delete_count: params.annotationsToDeleteCount
    })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ANNOTATION_CLASS_DELETE)
  }

  const payload: StoreMutationPayload<typeof REMOVE_CLASSES> = params.annotationClassIds
  commit('REMOVE_CLASSES', payload)

  return response
}
