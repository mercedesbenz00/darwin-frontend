import { isEqual } from 'lodash'

import { AClassAction } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import { updateAnnotationClass as request } from '@/utils/backend'

type Payload = {
  id: number
  annotationTypeNames?: AnnotationTypeName[]
  datasets?: AnnotationClassPayload['datasets']
  description?: string | null
  images?: AnnotationClassPayload['images']
  metadata?: AnnotationClassPayload['metadata']
  name?: string
}

type Action = AClassAction<Payload, AnnotationClassPayload>

/**
 * Update Existing Annotation Class for the current dataset
 */
export const updateAnnotationClass: Action = async ({ commit, state }, payload) => {
  const original = state.classes.find(c => c.id === payload.id)
  if (!original) {
    throw new Error("Cannot update class which isn't loaded into store")
  }

  // Initial params is just the id. All the other changes are optional, so are sent to
  // the backend only if they are actual changes.
  const params: Parameters<typeof request>[0] = { id: original.id }

  if (payload.annotationTypeNames) {
    const originalTypeNames = [...original.annotation_types].sort()
    const newTypeNames = [...payload.annotationTypeNames].sort()
    if (!isEqual(originalTypeNames, newTypeNames)) {
      const annotationTypeIds = state.types
        .filter(t => newTypeNames.includes(t.name))
        .map(t => t.id)

      if (annotationTypeIds.length !== newTypeNames.length) {
        throw new Error('[aclass/updateAnnotationClass] Invalid type names specified')
      }
      params.annotation_type_ids = annotationTypeIds
    }
  }

  if (payload.name !== undefined && original.name !== payload.name) {
    params.name = payload.name
  }

  if (payload.description !== undefined && original.description !== payload.description) {
    params.description = payload.description
  }

  // For datasets and images, we shallow clone the arrays, so we can sort them
  // and then properly compare with each other. Not shallow cloning means we would
  // mutate the original arrays, which should not happen.

  if (
    payload.datasets &&
    !isEqual([...original.datasets].sort(), [...payload.datasets].sort())
  ) { params.datasets = payload.datasets }

  if (
    payload.images &&
    !isEqual([...original.images].sort(), [...payload.images].sort())
  ) { params.images = payload.images }

  if (payload.metadata && !isEqual(original.metadata, payload.metadata)) {
    params.metadata = payload.metadata
  }

  const response = await request(params)

  if ('data' in response) {
    commit('PUSH_CLASS', response.data)
  }
  return response
}
