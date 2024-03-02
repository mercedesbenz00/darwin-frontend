import { createLocalVue, shallowMount } from '@vue/test-utils'

import AnnotationTypeFilter from '@/components/Classes/Sidebar/AnnotationTypeFilter.vue'
import { AnnotationTypeFilterItemType } from '@/components/Classes/Sidebar/types'

const localVue = createLocalVue()

const options: AnnotationTypeFilterItemType[] = [{
  id: '1',
  name: 'bounding_box',
  label: 'Bounding Box',
  svgUrl: 'bounding_box.svg',
  color: 'rgba(0, 0, 0, 1)',
  count: 5
}, {
  id: '2',
  name: 'tag',
  label: 'Tag',
  svgUrl: 'tag.svg',
  color: 'rgba(0, 0, 0, 1)',
  count: 1
}]

const defaultProps = {
  options,
  value: [],
  showAll: true,
  allCount: 6
}

it('matches snapshot', () => {
  const propsData = defaultProps
  const wrapper = shallowMount(AnnotationTypeFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits change/input when option is clicked', () => {
  const propsData = defaultProps
  const wrapper = shallowMount(AnnotationTypeFilter, { localVue, propsData })
  wrapper.findAll('annotation-type-filter-item-stub').at(1).vm.$emit('click', options[0])
  expect(wrapper.emitted().change![0]).toEqual([['bounding_box']])
})

it('emits change/input when all option is clicked', () => {
  const propsData = defaultProps
  const wrapper = shallowMount(AnnotationTypeFilter, { localVue, propsData })
  wrapper.findAll('annotation-type-filter-item-stub').at(0).vm.$emit('click')
  expect(wrapper.emitted().change![0]).toEqual([['bounding_box', 'tag']])
})
