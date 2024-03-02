import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import ClassDistribution from '@/components/Dataset/ClassDistribution/ClassDistribution.vue'
import { AnnotationClassPayload, DatasetReportClassDistributionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = createTestStore()
setDefaultAnnotationTypes(store)

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

const annotationClasses = [scale, bottle, blurry]

let distributionByImage: DatasetReportClassDistributionPayload[]
let distributionByAnnotationInstance: DatasetReportClassDistributionPayload[]

let propsData: {
  annotationClasses: AnnotationClassPayload[],
  distributionByImage: DatasetReportClassDistributionPayload[],
  distributionByAnnotationInstance: DatasetReportClassDistributionPayload[]
}

beforeEach(() => {
  distributionByImage = [
    { id: scale.id, name: scale.name, count: 10 },
    { id: bottle.id, name: bottle.name, count: 200 },
    { id: blurry.id, name: blurry.name, count: 30 }
  ]
  distributionByAnnotationInstance = [
    { id: scale.id, name: scale.name, count: 1000 },
    { id: bottle.id, name: bottle.name, count: 2000 },
    { id: blurry.id, name: blurry.name, count: 50 }
  ]

  propsData = {
    annotationClasses,
    distributionByImage,
    distributionByAnnotationInstance
  }
})

const model = {
  tabs: 'gray-rounded-tabs-stub'
}

describe('instances tab', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistribution, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('images tab', () => {
  it('matches snapshot', async () => {
    const wrapper = shallowMount(ClassDistribution, { localVue, propsData, store })
    await wrapper.find(model.tabs).vm.$emit('update:current-tab', 'images')
    expect(wrapper).toMatchSnapshot()
  })
})
