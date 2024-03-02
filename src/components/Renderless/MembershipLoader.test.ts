import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import MembershipLoader from '@/components/Renderless/MembershipLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('does nothing if no current team', () => {
  shallowMount(MembershipLoader, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalled()
})

it('dispatches load actions when team is first set', async () => {
  const wrapper = shallowMount(MembershipLoader, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalled()

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).toHaveBeenCalledWith('team/getPartnerMemberships')
})

it('dispatches load actions when team set on mount', () => {
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  shallowMount(MembershipLoader, { localVue, store })

  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).toHaveBeenCalledWith('team/getPartnerMemberships')
})

it('dispatches load actions when team changes on mount', async () => {
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  const wrapper = shallowMount(MembershipLoader, { localVue, store })

  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).toHaveBeenCalledWith('team/getPartnerMemberships')

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 8 }))
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).toHaveBeenCalledWith('team/getPartnerMemberships')
  expect(store.dispatch).toHaveBeenCalledTimes(4)
})
