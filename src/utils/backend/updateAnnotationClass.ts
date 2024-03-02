import { AnnotationClassPayload } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Defines param structure for the updateAnnotationClass backend action
 */
type Params = {
  /* eslint-disable camelcase */
  annotation_type_ids?: number[]
  datasets?: AnnotationClassPayload['datasets']
  description?: string | null
  id: number
  images?: AnnotationClassPayload['images']
  metadata?: AnnotationClassPayload['metadata']
  name?: string
  /* eslint-enable camelcase */
}

/**
 * Creates annotation class on backend
 */
export const updateAnnotationClass = async (params: Params) => {
  const path = `annotation_classes/${params.id}`

  try {
    const response = await put(path, params)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ANNOTATION_CLASS_CREATE)
  }
}
