import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import ClassLoader from '@/components/Renderless/ClassLoader'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7, slug: 'teamSlug' }))
})

it('loads classes on mount', () => {
  shallowMount(ClassLoader, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('aclass/loadTeamAnnotationClasses', { teamSlug: 'teamSlug' })
})

it('loads classes on team change', async () => {
  const wrapper = shallowMount(ClassLoader, { localVue, store });
  (store.dispatch as jest.Mock).mockClear()

  expect(store.dispatch).not.toHaveBeenCalled()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 9, slug: 'teamSlug1' }))
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('aclass/loadTeamAnnotationClasses', { teamSlug: 'teamSlug1' })
})
