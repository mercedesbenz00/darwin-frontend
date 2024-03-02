import { AClassAction } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'
import {
  api,
  errorMessages,
  isErrorResponse,
  parseError
} from '@/utils'

type UpdateAnnotationAttribute = AClassAction<
  { classId: number | undefined,
    id: string | undefined,
    name: string,
    color: string
  },
  AttributePayload
>

/**
 * Update the attribute with the new details
 * @param {integer} annotationClassId containing the attribute
 * @param {string} id the id of the attribute to update
 * @param {string} name the name of the attribute to update
 * @param {string} color the color of the attribute to update
 */
export const updateAnnotationAttribute: UpdateAnnotationAttribute =
  async ({ commit }, args) => {
    const {
      classId,
      id,
      name,
      color
    } = args
    const path = `annotation_classes/${classId}/attributes/${id}`

    let response
    try {
      response = await api.put(path, {
        name,
        color
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.ANNOTATION_CLASS_UPDATE, args)
    }

    commit('UPDATE_ANNOTATION_ATTRIBUTE', response.data)

    return response
  }
