import { AClassAction } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { updateAnnotationClass as request } from '@/utils/backend'

type Payload = {
  annotationClass: AnnotationClassPayload
  dataset: DatasetPayload
}

type Action = AClassAction<Payload, AnnotationClassPayload>

/**
 * Remove Annotation Class from linked Dataset
 */
export const removeFromDataset: Action = async ({ commit }, payload) => {
  const {
    annotationClass,
    dataset
  } = payload
  const datasets = [...annotationClass.datasets]
  const idx = datasets.findIndex(d => d.id === dataset.id)

  // No need to update the backend again
  if (idx < 0) {
    return { data: annotationClass }
  }
  datasets.splice(idx, 1)

  const params: Parameters<typeof request>[0] = {
    id: annotationClass.id,
    datasets
  }

  const response = await request(params)

  if ('data' in response) {
    commit('PUSH_CLASS', response.data)
  }
  return response
}
