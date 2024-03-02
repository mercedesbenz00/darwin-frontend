import { buildAnnotationClassPayload } from 'test/unit/factories'

import { DistributionStatus } from '@/components/Dataset/ClassDistribution/types'
import {
  getAnnotationClassDistribution,
  getDistributionStatus,
  getMean
} from '@/components/Dataset/ClassDistribution/utils'
import { DatasetReportClassDistributionPayload } from '@/store/types'

const scale = buildAnnotationClassPayload({
  id: 1,
  team_id: 1,
  name: 'Scale',
  metadata: { _color: 'rgba(6,6,6,0.5)' },
  description: '',
  images: [],
  annotation_types: ['bounding_box']
})

const bottle = buildAnnotationClassPayload({
  id: 2,
  team_id: 1,
  name: 'Bottle',
  metadata: { _color: 'rgba(5,5,5,0.5)' },
  description: '',
  images: [],
  annotation_types: ['polygon']
})

const blurry = buildAnnotationClassPayload({
  id: 3,
  name: 'Blurry',
  metadata: { _color: 'rgba(7,7,7,0.5)' },
  team_id: 1,
  images: [],
  annotation_types: ['tag']
})

describe('getMean', () => {
  it('returns 0 when counts are less than 100', () => {
    const distribution: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 10 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 30 }
    ]
    expect(getMean(distribution)).toEqual(0)
  })

  it('returns mean of those of which count is greater than or equal 100', () => {
    const distribution: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 100 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 300 }
    ]
    expect(getMean(distribution)).toEqual(200)
  })
})

describe('getAnnotationClassDistribution', () => {
  it('returns the class distribution', () => {
    const annotationClasses = [scale, bottle, blurry]
    const distributionByImages: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 10 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 30 }
    ]
    const distributionByInstances: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 500 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 700 }
    ]

    const classDistributions = getAnnotationClassDistribution(
      annotationClasses,
      distributionByImages,
      distributionByInstances
    )

    expect(classDistributions).toEqual([
      {
        annotationClass: scale,
        countByImages: 10,
        countByInstances: 500,
        status: DistributionStatus.BALANCED
      },
      {
        annotationClass: bottle,
        countByImages: 20,
        countByInstances: 20,
        status: DistributionStatus.VERY_LOW_DATA
      },
      {
        annotationClass: blurry,
        countByImages: 30,
        countByInstances: 700,
        status: DistributionStatus.BALANCED
      }
    ])
    expect(true).toBeTruthy()
  })

  it('returns very-low-data when there is only one annotation class', () => {
    const distributionByImages: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 10 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 30 }
    ]
    const distributionByInstances: DatasetReportClassDistributionPayload[] = [
      { id: scale.id, name: scale.name, count: 500 },
      { id: bottle.id, name: bottle.name, count: 20 },
      { id: blurry.id, name: blurry.name, count: 700 }
    ]

    const classDistributions = getAnnotationClassDistribution(
      [bottle],
      distributionByImages,
      distributionByInstances
    )
    expect(classDistributions).toEqual([
      {
        annotationClass: bottle,
        countByImages: 20,
        countByInstances: 20,
        status: DistributionStatus.VERY_LOW_DATA
      }
    ])
    expect(true).toBeTruthy()
  })
})

describe('getDistributionStatus', () => {
  describe('when mean greater than zero', () => {
    it('returns VERY_OVERREPRESENTED when value > mean * 1.5', () => {
      expect(getDistributionStatus(151, 100)).toEqual(DistributionStatus.VERY_OVERREPRESENTED)
    })

    it('returns OVERREPRESENTED when value > mean * 1.3', () => {
      expect(getDistributionStatus(131, 100)).toEqual(DistributionStatus.OVERREPRESENTED)
    })

    it('returns VERY_LOW_DATA when value < 30', () => {
      expect(getDistributionStatus(29, 100)).toEqual(DistributionStatus.VERY_LOW_DATA)
    })

    it('returns UNDERREPRESENTED when value < mean * 0.7', () => {
      expect(getDistributionStatus(699, 1000)).toEqual(DistributionStatus.UNDERREPRESENTED)
    })

    it('returns VERY_UNDERREPRESENTED when value < mean * 0.5', () => {
      expect(getDistributionStatus(499, 1000)).toEqual(DistributionStatus.VERY_UNDERREPRESENTED)
    })

    it('returns LOW_DATA when value < 100', () => {
      expect(getDistributionStatus(99, 100)).toEqual(DistributionStatus.LOW_DATA)
    })

    it('returns MEDIUM_LOW_DATA when value < 500', () => {
      expect(getDistributionStatus(499, 500)).toEqual(DistributionStatus.MEDIUM_LOW_DATA)
    })

    it('returns BALANCED when value is around mean', () => {
      expect(getDistributionStatus(500, 500)).toEqual(DistributionStatus.BALANCED)
    })
  })

  describe('when mean is zero', () => {
    it('returns VERY_LOW_DATA when value < 30', () => {
      expect(getDistributionStatus(29, 0)).toEqual(DistributionStatus.VERY_LOW_DATA)
    })

    it('returns LOW_DATA when value < 100', () => {
      expect(getDistributionStatus(99, 0)).toEqual(DistributionStatus.LOW_DATA)
    })

    it('returns MEDIUM_LOW_DATA when value < 500', () => {
      expect(getDistributionStatus(499, 0)).toEqual(DistributionStatus.MEDIUM_LOW_DATA)
    })

    it('returns BALANCED when value is around mean', () => {
      expect(getDistributionStatus(500, 0)).toEqual(DistributionStatus.BALANCED)
    })
  })
})
