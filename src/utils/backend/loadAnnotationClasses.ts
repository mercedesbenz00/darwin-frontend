import { AnnotationClassPayload } from '@/store/types'
import { AClassFilter } from '@/store/types/AClassFilter'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = AClassFilter & {
  teamSlug: string
}

type BackendQueryParams = AClassFilter & {
  /* eslint-disable camelcase */
  dataset_ids?: number[]
  not_dataset_ids?: number[]
  /* eslint-enable camelcase */
}

type Response = {
  /* eslint-disable camelcase */
  annotation_classes: AnnotationClassPayload[],
  type_counts: { id: number, name: string, count: number }[]
  /* eslint-enable camelcase */
}

export const loadAnnotationClasses = async (params: Params) => {
  const { teamSlug, ...rest } = params
  const path = `teams/${teamSlug}/annotation_classes`

  const backendParams: BackendQueryParams = { ...rest }

  try {
    const response = await get<Response>(path, backendParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ANNOTATION_CLASS_LOAD)
  }
}
