import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'

export type AnnotationTypeCount = {
  annotationType: AnnotationTypePayload
  total: number
}

export type ClassDistributionTab = 'instances' | 'files'

export enum DistributionStatus {
  VERY_OVERREPRESENTED = 'very-overrepresented',
  OVERREPRESENTED = 'overrepresented',
  BALANCED = 'balanced',
  UNDERREPRESENTED = 'underrepresented',
  VERY_UNDERREPRESENTED = 'very-underrepresented',

  VERY_LOW_DATA = 'very-low-data',
  LOW_DATA = 'low-data',
  MEDIUM_LOW_DATA = 'medium-low-data'
}

export type ClassOverallDistribution = {
  annotationClass: AnnotationClassPayload,
  countByImages: number
  countByInstances: number
  status: DistributionStatus
}

export type ClassDistributionDimension = keyof Pick<
  ClassOverallDistribution, 'countByImages' | 'countByInstances'
>

export type ClassIndividualDistribution = {
  annotationClass: AnnotationClassPayload,
  count: number
  status: DistributionStatus
}
