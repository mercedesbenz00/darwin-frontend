import { DatasetPayload } from '@/store/types'

export const datasetName = (dataset: DatasetPayload | null) =>
  dataset ? dataset.name : 'N/A'
