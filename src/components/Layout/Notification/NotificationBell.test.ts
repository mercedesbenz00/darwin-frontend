import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import NotificationBell from '@/components/Layout/Notification/NotificationBell.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const v7 = buildTeamPayload({ name: 'v7', id: 1 })

it('matches snapshot when no unread notifications', () => {
  const wrapper = shallowMount(NotificationBell, { localVue, store })
  expect(wrapper.element).toMatchSnapshot()
})

it('matches snapshot unread notifications', () => {
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('notification/BY_TEAM_UNREAD_COUNT', [[v7.id, 5]])
  const wrapper = shallowMount(NotificationBell, { localVue, store })
  expect(wrapper.element).toMatchSnapshot()
})

it('show modal when you click on the bell', () => {
  const mocks = { $modal: { show: jest.fn() } }
  store.commit('auth/SET_AUTHENTICATED', true)
  const wrapper = shallowMount(NotificationBell, { localVue, mocks, store })
  wrapper.find('.sidebar__bell').trigger('click')
  expect(mocks.$modal.show).toBeCalledWith('modal-notifications')
})
