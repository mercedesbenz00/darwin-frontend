import { AnnotationTypePayload } from '@/store/types'
import { get } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export const loadAnnotationTypes = async () => {
  try {
    const { data } = await get<AnnotationTypePayload[]>('annotation_types')
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ANNOTATION_TYPE_LOAD)
  }
}
