import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import ClassFilter from '@/components/DatasetFiltering/ClassFilter/V1/ClassFilter.vue'
import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V1/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
const options = [{
  id: 1,
  aclass: buildAnnotationClassPayload({ id: 1 }),
  label: 'Polygon',
  icon: 'polygon.svg',
  count: 5
}, {
  id: 2,
  aclass: buildAnnotationClassPayload({ id: 2, name: 'tag' }),
  label: 'Tag',
  icon: 'tag.svg',
  count: 1
}]

let propsData: {
  options: ClassFilterItemType[]
  positiveOptions: string[]
  negativeOptions: string[]
  imagesSelecting?: boolean
  listOnly?: boolean
}

const ClassFilterItem = localVue.extend({
  props: { data: Object },
  template: `
    <div>{{data.label}}</div>
  `
})

const stubs: Stubs = { ClassFilterItem, 'input-field': true }

beforeEach(() => {
  propsData = {
    options,
    positiveOptions: [],
    negativeOptions: []
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ClassFilter, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when images are being selected', () => {
  propsData.imagesSelecting = true
  const wrapper = shallowMount(ClassFilter, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when listing only', () => {
  propsData.listOnly = true
  const wrapper = shallowMount(ClassFilter, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot after sorted by label desc', async () => {
  const wrapper = shallowMount(ClassFilter, { localVue, propsData, stubs })
  wrapper.vm.$data.sortBy = 'label'
  wrapper.vm.$data.sortOrder = 2
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot after sorted by count asc', async () => {
  const wrapper = shallowMount(ClassFilter, { localVue, propsData, stubs })
  await wrapper.findAll('sort-button-stub').at(1).vm.$emit('click')
  expect(wrapper).toMatchSnapshot()
})

it('enable create tag button after adding keyword', async () => {
  const wrapper = shallowMount(ClassFilter, { localVue, propsData })
  wrapper.vm.$data.tagKeyword = 'new tag'
  await wrapper.vm.$nextTick()
  await wrapper.findAll('.class-filter__create-tag').trigger('click')
  expect(wrapper.emitted()['create-tag']).toEqual([['new tag']])
})

it('emits change/input event when you select filters', async () => {
  const wrapper = shallowMount(ClassFilter, { localVue, propsData })
  await wrapper.findAll('class-filter-item-stub').at(0).vm.$emit('click', options[0])
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: ['1'],
    negativeOptions: []
  }]])
})

it('emits change/input event when you select filters', async () => {
  propsData.positiveOptions = ['1']
  const wrapper = shallowMount(ClassFilter, { localVue, propsData })
  await wrapper.findAll('class-filter-item-stub').at(0).vm.$emit('click', options[0])
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: [],
    negativeOptions: ['1']
  }]])
})

it('emits change/input event with empty array when you click on clear filter', async () => {
  propsData.positiveOptions = ['1']
  propsData.negativeOptions = ['2']
  const wrapper = shallowMount(ClassFilter, { localVue, propsData })
  await wrapper.find('.class-filter__clear').trigger('click')
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: [],
    negativeOptions: []
  }]])
})

it('emits change/input event when you shift-click on filter item', async () => {
  propsData.positiveOptions = []
  propsData.negativeOptions = ['2']
  const wrapper = shallowMount(ClassFilter, { localVue, propsData })
  await wrapper.findAll('class-filter-item-stub').at(0).vm.$emit('shift-click', options[0])
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: ['1'],
    negativeOptions: []
  }]])
})
