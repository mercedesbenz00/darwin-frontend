import {
  AnnotationDataGranularity
} from '@/components/Annotators/AnnotationMetrics/types'
import { DatasetAnnotationReportPayload } from '@/store/types'

export type AnnotationReportParams = {
  datasetId: number
  from: string | null
  granularity: AnnotationDataGranularity
  groupBy: string
}

export type AnnotationReport = {
  data: DatasetAnnotationReportPayload[]
  params: AnnotationReportParams
}

export type AnnotatorsState = {
  annotationReports: AnnotationReport[]
}
