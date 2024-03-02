import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildNotificationPayload, buildTeamPayload } from 'test/unit/factories'

import NotificationModal from '@/components/Layout/Notification/NotificationModal.vue'
import { NotificationPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

let propsData: { notifications: NotificationPayload[] }

beforeEach(() => {
  const v7 = buildTeamPayload({ name: 'v7', id: 1 })
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('notification/ADD_NOTIFICATIONS', [
    buildNotificationPayload({ id: 1, team_id: v7.id }),
    buildNotificationPayload({ id: 2, team_id: v7.id }),
    buildNotificationPayload({ id: 3, team_id: v7.id })
  ])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(NotificationModal, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when sidebar minimized', () => {
  store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
  const wrapper = shallowMount(NotificationModal, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits show settings on settings icon click', () => {
  const wrapper = shallowMount(NotificationModal, { localVue, propsData, store })
  wrapper.find('.modal__notifications__header__settings').trigger('click')
  expect(store.dispatch).toBeCalledWith('ui/showSettingsDialog', { tab: 'notifications' })
})
