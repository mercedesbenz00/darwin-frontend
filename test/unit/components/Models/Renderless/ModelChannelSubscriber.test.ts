import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import ModelChannelSubscriber from '@/components/Models/Renderless/ModelChannelSubscriber'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const team = buildTeamPayload({ id: 55 })

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', team)
})

it('joins channel mount', () => {
  shallowMount(ModelChannelSubscriber, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/joinChannel', { topic: 'models:55' })
})

it('leaves old, joins new channel on current team change', async () => {
  shallowMount(ModelChannelSubscriber, { localVue, store })
  await flushPromises()

  const anotherTeam = buildTeamPayload({ id: 56 })

  store.commit('team/SET_CURRENT_TEAM', anotherTeam)
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/leaveChannel', { topic: 'models:55' })
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/joinChannel', { topic: 'models:56' })
})

it('leaves channel on destroy', async () => {
  const wrapper = shallowMount(ModelChannelSubscriber, { localVue, store })
  await flushPromises()
  await wrapper.vm.$destroy()
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/leaveChannel', { topic: 'models:55' })
})
