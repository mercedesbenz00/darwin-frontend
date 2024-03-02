import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import WorkflowLoader from '@/components/Renderless/WorkflowLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('does nothing if no current team', () => {
  shallowMount(WorkflowLoader, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalled()
})

it('dispatches load actions when team is first set', async () => {
  const wrapper = shallowMount(WorkflowLoader, { localVue, store })
  expect(store.dispatch).not.toHaveBeenCalled()

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('v2Workflow/loadWorkflows', { worker: false })
})

it('dispatches load actions when team set on mount', () => {
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  shallowMount(WorkflowLoader, { localVue, store })

  expect(store.dispatch).toHaveBeenCalledWith('v2Workflow/loadWorkflows', { worker: false })
})

it('dispatches load actions when team changes', async () => {
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7 }))
  const wrapper = shallowMount(WorkflowLoader, { localVue, store })

  expect(store.dispatch).toHaveBeenCalledTimes(2)
  expect(store.dispatch).toHaveBeenLastCalledWith('v2Workflow/loadWorkflows', { worker: false })

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 8 }))
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledTimes(3)
  expect(store.dispatch).toHaveBeenLastCalledWith('v2Workflow/loadWorkflows', { worker: false })
})
