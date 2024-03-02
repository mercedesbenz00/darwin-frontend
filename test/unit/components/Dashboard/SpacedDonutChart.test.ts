import { createLocalVue, shallowMount } from '@vue/test-utils'

import SpacedDonutChart from '@/components/Dashboard/SpacedDonutChart.vue'

const localVue = createLocalVue()
localVue.directive('loading', () => {})

const data = [
  { value: 10, color: 'FFFFFF' },
  { value: 11, color: '000000' },
  { value: 12, color: 'AAAAAA' }
]

const unbalancedData = [
  { value: 100, color: 'FFFFFF' },
  { value: 100, color: '000000' },
  { value: 1, color: 'AAAAAA' }
]

const severelyUnbalancedData = [
  { value: 100, color: 'FFFFFF' },
  { value: 1, color: '000000' },
  { value: 1, color: 'AAAAAA' }
]

const blankData = [
  { value: 0, color: 'FFFFFF' },
  { value: 0, color: '000000' },
  { value: 0, color: 'AAAAAA' }
]

it('matches snapshot', () => {
  const propsData = { data }
  const wrapper = shallowMount(SpacedDonutChart, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when an item is much smaller than others', () => {
  const propsData = { data: unbalancedData }
  const wrapper = shallowMount(SpacedDonutChart, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when only one item is big enough to show', () => {
  const propsData = { data: severelyUnbalancedData }
  const wrapper = shallowMount(SpacedDonutChart, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when all items are at 0', () => {
  const propsData = { data: blankData }
  const wrapper = shallowMount(SpacedDonutChart, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
