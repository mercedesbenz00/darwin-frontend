/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import AcademyMenuItem from '@/components/Layout/Sidebar/AcademyMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true
}

it('matches snapshot', () => {
  const store = createTestStore()
  const wrapper = mount(AcademyMenuItem, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
