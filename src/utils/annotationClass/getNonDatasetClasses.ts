import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

export const getNonDatasetClasses = (
  annotationClasses: AnnotationClassPayload[],
  datasetId: DatasetPayload['id']
): AnnotationClassPayload[] => {
  return annotationClasses.filter(ac =>
    !ac.datasets.find(({ id }) => id === datasetId)
  )
}
