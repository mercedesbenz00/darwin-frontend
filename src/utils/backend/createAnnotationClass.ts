import { AnnotationClassPayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  /* eslint-disable camelcase */
  annotation_type_ids: number[]
  datasets: AnnotationClassPayload['datasets']
  description: string | null
  images: AnnotationClassPayload['images']
  metadata: AnnotationClassPayload['metadata']
  name: string
  team_slug: string
  /* eslint-enable camelcase */
}

/**
 * Creates annotation class on backend
 */
export const createAnnotationClass = async (params: Params) => {
  const { team_slug: teamSlug, ...rest } = params
  const path = `teams/${params.team_slug}/annotation_classes`

  try {
    const response = await post<AnnotationClassPayload>(path, rest)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ANNOTATION_CLASS_CREATE)
  }
}
