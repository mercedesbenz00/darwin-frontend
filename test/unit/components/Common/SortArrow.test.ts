import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import SortArrow from '@/components/Common/SortArrow/SortArrow.vue'

const localVue = createLocalVue()
const mocks = { $theme: createMockTheme() }

it('matches snapshot with default props', () => {
  const propsData = {}
  const wrapper = shallowMount(SortArrow, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorAliceShadow')
  expect(wrapper).toMatchSnapshot()
})

it('renders the right color for ascending, selected', () => {
  const propsData = { selected: true }
  shallowMount(SortArrow, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorBlack')
})

it('matches snapshot with descending, non-selected', () => {
  const propsData = { order: 'descending' }
  const wrapper = shallowMount(SortArrow, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorAliceShadow')
  expect(wrapper).toMatchSnapshot()
})

it('renders the right color for descending, selected', () => {
  const propsData = { order: 'descending', selected: true }
  shallowMount(SortArrow, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorBlack')
})
