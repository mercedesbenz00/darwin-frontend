import { MembershipPayload, DatasetAnnotationReportPayload } from '@/store/types'

export type AnnotationDataRange = 'total' | 'month' | 'week' | 'day'
export type AnnotationDataGranularity = 'day' | 'hour'

export type ChartDimension =
  'annotationTime' |
  'imagesAnnotated' |
  'avgTimePerAnnotation' |
  'annotationsCreated' |
  'reviewPassRate'

export type AdaptedDataPoint =
  {[k in Exclude<ChartDimension, 'reviewPassRate' | 'avgTimePerAnnotation'>]: number } &
  {[k in Extract<ChartDimension, 'reviewPassRate' | 'avgTimePerAnnotation'>]: number | null} &
  { userId: number | null, date: string }

export type AggregatedDataPoint = Pick<
    DatasetAnnotationReportPayload,
    | 'annotation_time'
    | 'annotations_approved'
    | 'annotations_created'
    | 'date'
    | 'images_annotated'
    | 'images_approved'
    | 'images_rejected'
    | 'user_id'
  >

export type AnnotationDimensionData = {
  annotationTime: number,
  annotationsCreated: number,
  avgTimePerAnnotation: number | null,
  imagesAnnotated: number,
  reviewPassRate: number | null
}

export type AnnotationChartData = {
  data: AdaptedDataPoint[]
  dimensions: AnnotationDimensionData
  member?: MembershipPayload
  visible: boolean
}

export type AnnotationBarChartData = {
  data: AggregatedDataPoint[]
  member?: MembershipPayload
}

/**
 * Format for a single item to be shown in a chart tooltip.
 *
 * A tooltip will contain multiple items
 */
export type ChartTooltipData = { member: MembershipPayload | null, value: string}
