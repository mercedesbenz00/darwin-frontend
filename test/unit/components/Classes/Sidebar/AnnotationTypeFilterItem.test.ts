import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import AnnotationTypeFilterItem from '@/components/Classes/Sidebar/AnnotationTypeFilterItem.vue'
import FilterItem from '@/components/Common/Filter/FilterItem.vue'

const localVue = createLocalVue()

const mocks = {
  $theme: createMockTheme()
}
const data = {
  id: '1',
  name: 'bounding_box',
  label: 'Bounding Box',
  color: 'rgba(0, 0, 0, 1)',
  count: 5
}

/**
 * We unstub the FilterItem component because it's complex and supports up to
 * 3 different slots, which a stubbed component wouldn't render. This way, our
 * snapshots are safer
 */
const stubs = { FilterItem }

it('matches snapshot when selected', () => {
  const propsData = { data, selected: true }
  const wrapper = shallowMount(AnnotationTypeFilterItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not selected', () => {
  const propsData = { data, selected: false }
  const wrapper = shallowMount(AnnotationTypeFilterItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits click', () => {
  const propsData = { data, selected: false }
  const wrapper = shallowMount(AnnotationTypeFilterItem, { localVue, mocks, propsData, stubs })
  wrapper.find('.annotation-type-filter-item').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
