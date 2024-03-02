/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildBillingInfoPayload } from 'test/unit/factories'

import FeedbackMenuItem from '@/components/Layout/Sidebar/FeedbackMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true
}

let store: ReturnType<typeof createTestStore>
let info: ReturnType<typeof buildBillingInfoPayload>

beforeEach(() => {
  store = createTestStore()

  info = buildBillingInfoPayload({})
  store.commit('billing/SET_BILLING_INFO', info)
})

it('matches snapshot', () => {
  const wrapper = mount(FeedbackMenuItem, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('displays "Support" for none-freemium teams', () => {
  const wrapper = mount(FeedbackMenuItem, { localVue, store, stubs })
  expect(wrapper.find('.sidebar__menu__label').text()).toContain('Support')
})

it('displays "Community Support" for freemium teams', () => {
  store.commit('billing/SET_BILLING_INFO', { ...info, freemium: true })
  const wrapper = mount(FeedbackMenuItem, { localVue, store, stubs })
  expect(wrapper.find('.sidebar__menu__label').text()).toContain('Community Support')
})
