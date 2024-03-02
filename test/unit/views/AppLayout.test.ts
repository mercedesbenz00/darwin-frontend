import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import { ThemeType } from '@/plugins/theme'
import AppLayout from '@/views/AppLayout.vue'

const localVue = createLocalVue()

const $route = { meta: { layout: 'main' } }
const stubs = ['main-layout', 'empty-layout', 'router-view']

let mocks: {
  $theme: ThemeType
  $route: typeof $route
}

beforeEach(() => {
  const $theme = createMockTheme()
  mocks = { $theme, $route }
})

it('matches snapshot on main layout', () => {
  $route.meta.layout = 'main'
  const wrapper = shallowMount(AppLayout, { localVue, mocks, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on empty layout', () => {
  $route.meta.layout = 'empty'
  const wrapper = shallowMount(AppLayout, { localVue, mocks, stubs })
  expect(wrapper).toMatchSnapshot()
})
