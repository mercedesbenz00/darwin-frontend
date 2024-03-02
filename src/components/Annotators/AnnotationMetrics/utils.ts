import moment from 'moment'

import { DatasetAnnotationReportPayload, MembershipPayload } from '@/store/types'

import {
  AdaptedDataPoint,
  AggregatedDataPoint,
  AnnotationDataGranularity,
  AnnotationDimensionData,
  AnnotationDataRange
} from './types'

/* builds a moment timestamp formatted a string matching those returned from backend */
export const buildFrom = (range: AnnotationDataRange) =>
  moment
    .utc()
    .subtract(1, range as moment.unitOfTime.DurationConstructor)
    .startOf('hour')
    .format('YYYY-MM-DDTHH:00:00.000000')

/**
 * Takes aggregated source report data and addaptes it for rendering on the line chart.
 *
 * This is done by computing necessary data points.
 */
export const adaptReportData = (r: AggregatedDataPoint): AdaptedDataPoint => ({
  annotationTime: r.annotation_time,
  avgTimePerAnnotation: r.annotations_created > 0
    ? r.annotation_time / r.annotations_created
    : null,
  date: r.date,
  userId: r.user_id,
  imagesAnnotated: r.images_annotated,
  annotationsCreated: r.annotations_created,
  reviewPassRate: r.images_approved > 0
    ? r.images_approved / (r.images_approved + r.images_rejected) * 100
    : null
})

/**
 * Returns a default adapted data point for a team member
 */
export const defaultData = (member: MembershipPayload, date: string): AggregatedDataPoint => ({
  date,
  user_id: member.user_id,
  annotation_time: 0,
  annotations_created: 0,
  annotations_approved: 0,
  images_annotated: 0,
  images_approved: 0,
  images_rejected: 0
})

export const getDimensionsData = (data: AdaptedDataPoint[]): AnnotationDimensionData => {
  const annotationTime = data.reduce((acc, r) => acc + r.annotationTime, 0)
  const annotationsCreated = data.reduce((acc, r) => acc + r.annotationsCreated, 0)
  const avgTimePerAnnotation = annotationsCreated === 0 ? null : annotationTime / annotationsCreated
  const imagesAnnotated = data.reduce((acc, r) => acc + r.imagesAnnotated, 0)

  const totalPassRate = data.reduce((acc, r) => acc + (r.reviewPassRate || 0), 0)
  const periodsWithPassRate = data.filter(r => r.reviewPassRate !== null).length
  const reviewPassRate = totalPassRate / periodsWithPassRate

  return {
    annotationTime,
    annotationsCreated,
    avgTimePerAnnotation,
    imagesAnnotated,
    reviewPassRate
  }
}

/**
 * Expands spars data points so each possible date in the series is covered.
 *
 * This is done by adding a default data point for any missing date
 *
 */
export const expandData = (
  member: MembershipPayload,
  data: AggregatedDataPoint[],
  dates: string[]
): AggregatedDataPoint[] =>
  dates.map(date => data.find(d => d.date === date) || defaultData(member, date))

export const aggregateByDate =
  (date: string, annotationReport: DatasetAnnotationReportPayload[]): AggregatedDataPoint => {
    const initial = {
      annotation_time: 0,
      annotations_created: 0,
      annotations_approved: 0,
      images_annotated: 0,
      images_approved: 0,
      images_rejected: 0
    }

    const reduced = annotationReport.filter(r => r.date === date).reduce((acc, r) => {
      acc.annotation_time += r.annotation_time
      acc.annotations_created += r.annotations_created
      acc.annotations_approved += r.annotations_approved
      acc.images_annotated += r.images_annotated
      acc.images_approved += r.images_approved
      acc.images_rejected += r.images_rejected
      return acc
    }, initial)

    return { ...reduced, date, user_id: null }
  }

export const dateRange =
  (fromDate: string, granularity: AnnotationDataGranularity, format: string) => {
    const from = moment.utc(fromDate)
    const now = moment.utc()
    const dates: string[] = []

    const step = granularity as moment.unitOfTime.DurationConstructor

    const diff = now.diff(from, step)

    for (let i = 0; i <= diff; i++) {
      dates.push(from.format(format))
      from.add(1, step)
    }

    return dates
  }

export const chartFormat = (granularity: AnnotationDataGranularity): string =>
  granularity === 'hour'
    ? 'YYYY-MM-DDTHH:00:00.000000'
    : 'YYYY-MM-DD'

/**
 * selectable data ranges for which we define a "from" parameter when fetching data
 */
const DEFINED_RANGES: AnnotationDataRange[] = ['month', 'week', 'day']

export const granularityFromRange = (range: AnnotationDataRange) => {
  if (range === 'day') { return 'hour' }
  if (range === 'week') { return 'hour' }
  return 'day'
}

/**
 * Computes a "from" param based on the specified range
 *
 * ```
 * 'total' -> null
 * 'month' -> start of hour a month ago
 * 'week' -> start of hour a week ago
 * 'day' -> start of hour a day ago
 * ```
 */
export const fromFromRange = (range: AnnotationDataRange) =>
  DEFINED_RANGES.includes(range) ? buildFrom(range) : null
