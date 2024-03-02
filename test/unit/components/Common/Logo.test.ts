import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import Logo from '@/components/Common/Logo.vue'

const localVue = createLocalVue()
const mocks = { $theme: createMockTheme() }

it('matches snapshot with default props', () => {
  const propsData = {}
  const wrapper = shallowMount(Logo, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorBlack')
  expect(wrapper).toMatchSnapshot()
})

it('renders the right color for gray, normal props', () => {
  const propsData = { theme: 'gray' }
  shallowMount(Logo, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorAliceShade')
})

it('matches snapshot with dark, small', () => {
  const propsData = { size: 'small' }
  const wrapper = shallowMount(Logo, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorBlack')
  expect(wrapper).toMatchSnapshot()
})

it('renders the right color for gray, small props', () => {
  const propsData = { theme: 'gray', size: 'small' }
  shallowMount(Logo, { localVue, mocks, propsData })
  expect(mocks.$theme.getColor).toBeCalledWith('colorAliceShade')
})
