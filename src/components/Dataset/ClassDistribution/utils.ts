import { meanBy } from 'lodash'

import { AnnotationClassPayload } from '@/store/types'
import { DatasetReportClassDistributionPayload } from '@/store/types/DatasetReportPayload'

import { ClassOverallDistribution, DistributionStatus } from './types'

/**
 * Mean should be calculated with distribution of which count is greater than or equal 100
 */
export const getMean = (distribution: DatasetReportClassDistributionPayload[]): number => {
  const above100Distribution = distribution.filter(d => d.count >= 100)
  const mean = meanBy(above100Distribution, 'count')
  return isNaN(mean) ? 0 : mean
}

export const getDistributionStatus = (value: number, mean: number): DistributionStatus => {
  if (value < 30) { return DistributionStatus.VERY_LOW_DATA }
  if (value < 100) { return DistributionStatus.LOW_DATA }
  if (mean > 0 && value > mean * 1.5) { return DistributionStatus.VERY_OVERREPRESENTED }
  if (mean > 0 && value > mean * 1.3) { return DistributionStatus.OVERREPRESENTED }
  if (mean > 0 && value < mean * 0.5) { return DistributionStatus.VERY_UNDERREPRESENTED }
  if (mean > 0 && value < mean * 0.7) { return DistributionStatus.UNDERREPRESENTED }
  if (value < 500) { return DistributionStatus.MEDIUM_LOW_DATA }
  return DistributionStatus.BALANCED
}

export const getAnnotationClassDistribution = (
  annotationClasses: AnnotationClassPayload[],
  distributionByImages: DatasetReportClassDistributionPayload[],
  distributionByInstances: DatasetReportClassDistributionPayload[]
): ClassOverallDistribution[] => {
  const classIds = annotationClasses.map(annotationClass => annotationClass.id)
  const filteredDistributionByInstances = distributionByInstances
    .filter((distribution) => classIds.includes(distribution.id))
  const mean = getMean(filteredDistributionByInstances)

  const classDistributions = annotationClasses.map((annotationClass) => {
    const matchImage = distributionByImages.find((d) => d.id === annotationClass.id)
    const matchInstance = filteredDistributionByInstances.find((d) => d.id === annotationClass.id)
    return {
      annotationClass,
      countByImages: matchImage ? matchImage.count : 0,
      countByInstances: matchInstance ? matchInstance.count : 0,
      status: getDistributionStatus(matchInstance ? matchInstance.count : 0, mean)
    }
  })
  return classDistributions
}
