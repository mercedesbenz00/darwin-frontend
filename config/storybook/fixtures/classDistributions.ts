import { orderBy } from 'lodash'

import { ClassOverallDistribution } from '@/components/Dataset/ClassDistribution/types'
import { getAnnotationClassDistribution } from '@/components/Dataset/ClassDistribution/utils'
import { DatasetReportClassDistributionPayload } from '@/store/types'

import { blurry, bottle, pipette, scale } from './annotationClasses'

const lowerData: DatasetReportClassDistributionPayload[] = [
  { id: scale.id, name: scale.name, count: 0 },
  { id: bottle.id, name: bottle.name, count: 20 },
  { id: pipette.id, name: pipette.name, count: 30 },
  { id: blurry.id, name: blurry.name, count: 1000 }
]

const mediumData: DatasetReportClassDistributionPayload[] = [
  { id: scale.id, name: 'scale', count: 0 },
  { id: bottle.id, name: bottle.name, count: 200 },
  { id: pipette.id, name: pipette.name, count: 300 },
  { id: blurry.id, name: blurry.name, count: 1000 }
]

const balancedData: DatasetReportClassDistributionPayload[] = [
  { id: scale.id, name: 'scale', count: 600 },
  { id: bottle.id, name: bottle.name, count: 20 },
  { id: pipette.id, name: pipette.name, count: 700 },
  { id: blurry.id, name: blurry.name, count: 1000 }
]

const annotationClasses = [blurry, bottle, pipette, scale]

export const lowerDataDistribution: ClassOverallDistribution[] =
  orderBy(getAnnotationClassDistribution(
    annotationClasses,
    lowerData,
    lowerData
  ), ['countByInstances'], ['desc'])

export const mediumDataDistribution: ClassOverallDistribution[] =
  orderBy(getAnnotationClassDistribution(
    annotationClasses,
    mediumData,
    mediumData
  ), ['countByInstances'], ['desc'])

export const balancedDataDistribution: ClassOverallDistribution[] =
  orderBy(getAnnotationClassDistribution(
    annotationClasses,
    balancedData,
    balancedData
  ), ['countByInstances'], ['desc'])
