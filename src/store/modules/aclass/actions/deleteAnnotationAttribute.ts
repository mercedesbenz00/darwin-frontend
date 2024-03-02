import { AClassAction } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'
import {
  api,
  errorMessages,
  isErrorResponse,
  parseError
} from '@/utils'

type DeleteAnnotationAttribute = AClassAction<
  { classId: number | undefined, id: number},
  AttributePayload
>

/**
 * Update the attribute with the new details
 * @param {integer} annotationClassId containing the attribute
 * @param {string} id the id of the attribute to update
 */
export const deleteAnnotationAttribute: DeleteAnnotationAttribute =
  async ({ commit }, args) => {
    const { classId, id } = args
    const path = `annotation_classes/${classId}/attributes/${id}`

    let response
    try {
      response = await api.remove(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ATTRIBUTE_DELETE, args)
    }

    commit('DELETE_ANNOTATION_ATTRIBUTE', response.data)
    return response
  }
