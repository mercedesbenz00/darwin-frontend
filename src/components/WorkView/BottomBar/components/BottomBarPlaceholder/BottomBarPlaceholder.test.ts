import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import { BottomBarPlaceholder } from '@/components/WorkView/BottomBar'

const localVue = createLocalVue()
localVue.directive('loading', () => {})

const $theme = createMockTheme()
const mocks = { $theme }

it('matches snapshot', () => {
  const wrapper = shallowMount(BottomBarPlaceholder, { localVue, mocks })
  expect(wrapper).toMatchSnapshot()
})
