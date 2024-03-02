import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

type HasDatasets = Pick<AnnotationClassPayload, 'datasets'>

export const getDatasetClasses = <T extends HasDatasets>(
  annotationClasses: T[],
  datasetId: DatasetPayload['id']
): T[] => {
  return annotationClasses.filter(ac =>
    !!ac.datasets.find(({ id }) => id === datasetId)
  )
}
