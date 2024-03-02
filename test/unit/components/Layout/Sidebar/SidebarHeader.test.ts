import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
// import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import SidebarHeader from '@/components/Layout/Sidebar/SidebarHeader.vue'
import clickOutsideDirective from '@/directives/click-outside'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)

let store: ReturnType<typeof createTestStore>

const stubs: Stubs = { 'dropdown-icon': true }

const v7 = buildTeamPayload({
  id: 1,
  name: 'V7',
  image: { id: 1, url: 'foo', thumbnail_url: 'bar' }
})
const v7NoImage = buildTeamPayload({ id: 1, name: 'V7 No Image', image: undefined })

beforeEach(() => {
  store = createTestStore()
})

describe('authenticated', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', true)
    store.commit('team/SET_CURRENT_TEAM', v7)
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot when sidebar minimized', () => {
    store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
    const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot when the team has no image', () => {
    store.commit('team/SET_CURRENT_TEAM', v7NoImage)
    const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot when the overlay is shown', async () => {
    const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
    wrapper.find('.sidebar__profile').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  // it('show modal when you click on profile', async () => {
  //   const mocks = { $modal: { show: jest.fn() } }
  //   store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
  //   const wrapper = shallowMount(SidebarHeader, { localVue, mocks, store, stubs })
  //   wrapper.find('.sidebar__profile').trigger('click')
  //   await wrapper.vm.$nextTick()
  //   expect(mocks.$modal.show).toBeCalledWith('modal-notifications')
  // })

  // it('joins notification channel if authenticated on mount', () => {
  //   store.commit('auth/SET_AUTHENTICATED', true)
  //   shallowMount(SidebarHeader, { localVue, store, stubs })
  //   expect(store.dispatch).toHaveBeenCalledWith('notification/joinNotificationsChannel')
  // })

  // it('joins notification channel when user becomes authenticated', async () => {
  //   store.commit('auth/SET_AUTHENTICATED', false)
  //   const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
  //   expect(store.dispatch).not.toHaveBeenCalledWith('notification/joinNotificationsChannel')
  //   store.commit('auth/SET_AUTHENTICATED', true)
  //   await wrapper.vm.$nextTick()
  //   expect(store.dispatch).toHaveBeenCalledWith('notification/joinNotificationsChannel')
  // })

  // it('dispatches error on join failure', async () => {
  //   store.commit('auth/SET_AUTHENTICATED', true)
  //   jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { foo: 'bar' } })
  //   shallowMount(SidebarHeader, { localVue, store, stubs })
  //   await flushPromises()
  //   expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: expect.any(String) })
  // })
})

describe('non-authenticated', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', false)
    store.commit('team/SET_CURRENT_TEAM', v7)
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(SidebarHeader, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})
