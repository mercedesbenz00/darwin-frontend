import { AClassAction } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { updateAnnotationClass } from '@/utils/backend'

type Payload = {
  annotationClass: AnnotationClassPayload
  dataset: DatasetPayload
}

type Action = AClassAction<Payload, AnnotationClassPayload>

/**
 * Link annotation class to dataset
 */
export const addToDataset: Action = async ({ commit }, payload) => {
  const {
    annotationClass,
    dataset
  } = payload
  const datasets = [...annotationClass.datasets]
  const existing = datasets.find(d => d.id === dataset.id)

  // No need to update the backend again
  if (existing) {
    return { data: annotationClass }
  }
  datasets.push({ id: dataset.id })

  const params: Parameters<typeof updateAnnotationClass>[0] = {
    id: annotationClass.id,
    datasets
  }

  const response = await updateAnnotationClass(params)

  if ('data' in response) {
    commit('PUSH_CLASS', response.data)
  }
  return response
}
