import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationTypePayload } from 'test/unit/factories'

import ClassDistributionAnnotationTypes from '@/components/Dataset/ClassDistribution/ClassDistributionAnnotationTypes.vue'
import { AnnotationTypeCount } from '@/components/Dataset/ClassDistribution/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

const polygon = buildAnnotationTypePayload({
  id: 11,
  name: 'polygon',
  granularity: 'main'
})

const boundingBox = buildAnnotationTypePayload({
  id: 21,
  name: 'bounding_box',
  granularity: 'main'
})

const tag = buildAnnotationTypePayload({
  id: 31,
  name: 'tag',
  granularity: 'main'
})

let propsData: {
  distribution: AnnotationTypeCount[]
  selectedType: string | null
}

beforeEach(() => {
  const distribution: AnnotationTypeCount[] = [
    { annotationType: polygon, total: 10 },
    { annotationType: tag, total: 20 },
    { annotationType: boundingBox, total: 30 }
  ]
  propsData = {
    distribution,
    selectedType: null
  }
})

describe('selected annotation type is All', () => {
  beforeEach(() => { propsData.selectedType = null })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistributionAnnotationTypes, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('selected annotation type is not All', () => {
  beforeEach(() => { propsData.selectedType = polygon.name })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistributionAnnotationTypes, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

it('emits null when All is clicked', async () => {
  const wrapper = shallowMount(ClassDistributionAnnotationTypes, { localVue, propsData })
  await wrapper.findAll('type-toggle-with-label-stub').at(3).vm.$emit('click')
  expect(wrapper.emitted()['update:selectedType']).toEqual([[null]])
})

it('emits annotation type when annotation type is clicked', async () => {
  const wrapper = shallowMount(ClassDistributionAnnotationTypes, { localVue, propsData })
  await wrapper.findAll('type-toggle-with-label-stub').at(0).vm.$emit('click')
  expect(wrapper.emitted()['update:selectedType']).toEqual([[boundingBox.name]])
})

describe('when given custom scoped slot for items', () => {
  const scopedSlots = {
    item: `
      <div class="item-stub" slot-scope="ctx">
        <div>Type: {{ctx.type}}</div>
        <div>Label: {{ctx.label}}</div>
        <div>Selected: {{ctx.selected}}</div>
      </div>
    `
  }

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistributionAnnotationTypes, {
      localVue,
      propsData,
      scopedSlots
    })
    expect(wrapper).toMatchSnapshot()
  })

  it('passes in proper context', () => {
    const wrapper = shallowMount(ClassDistributionAnnotationTypes, {
      localVue,
      propsData,
      scopedSlots
    })
    expect(wrapper.findAll('.item-stub').length).toEqual(3)
    const text = wrapper.text()
    expect(text).toContain('Type: bounding_box Label: 30 Selected: false')
    expect(text).toContain('Type: tag Label: 20 Selected: false')
    expect(text).toContain('Type: polygon Label: 10 Selected: false')
  })
})
