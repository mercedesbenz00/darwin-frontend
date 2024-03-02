import { createLocalVue, mount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import ClassDistributionTable from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassDistributionTable.vue'
import {
  ClassOverallDistribution,
  DistributionStatus,
  ClassDistributionDimension
} from '@/components/Dataset/ClassDistribution/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

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

let propsData: {
  distributions: ClassOverallDistribution[]
  dimension: ClassDistributionDimension
}

beforeEach(() => {
  const distributions: ClassOverallDistribution[] = [
    {
      annotationClass: scale,
      countByImages: 19,
      countByInstances: 39,
      status: DistributionStatus.VERY_OVERREPRESENTED
    },
    {
      annotationClass: bottle,
      countByImages: 20,
      countByInstances: 29,
      status: DistributionStatus.BALANCED
    },
    {
      annotationClass: blurry,
      countByImages: 0,
      countByInstances: 0,
      status: DistributionStatus.VERY_LOW_DATA
    }
  ]
  propsData = {
    distributions,
    dimension: 'countByInstances'
  }
})

const PopoverStub = localVue.component('VPopover', {
  template: '<div><slot name="popover"></slot></div>'
})
const stubs: Stubs = {
  'class-item': true,
  'balanced-icon': true,
  'very-overrepresented-icon': true,
  'class-distribution-progress': true,
  'v-popover': PopoverStub
}

describe('when viewing instance counts', () => {
  beforeEach(() => {
    propsData.dimension = 'countByInstances'
  })

  it('matches snapshot', () => {
    const wrapper = mount(ClassDistributionTable, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('calculates maximum of distribution by instances', () => {
    const wrapper = mount(ClassDistributionTable, { localVue, propsData, stubs })
    expect(wrapper.find('class-distribution-progress-stub').props('maxCount')).toEqual(39)
  })
})

describe('when viewing image counts', () => {
  beforeEach(() => {
    propsData.dimension = 'countByImages'
  })

  it('matches snapshot', () => {
    const wrapper = mount(ClassDistributionTable, { localVue, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('calculates maximum of distribution by instances', () => {
    const wrapper = mount(ClassDistributionTable, { localVue, propsData, stubs })
    expect(wrapper.find('class-distribution-progress-stub').props('maxCount')).toEqual(20)
  })
})
