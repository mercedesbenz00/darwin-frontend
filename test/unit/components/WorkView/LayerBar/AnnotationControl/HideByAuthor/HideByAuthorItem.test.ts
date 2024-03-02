import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import HideByAuthorItem
  from '@/components/WorkView/LayerBar/AnnotationControl/HideByAuthor/HideByAuthorItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 1 })
const user1 = buildMembershipPayload({ id: 1, first_name: 'Test', last_name: 'User1', team_id: v7.id, user_id: 1 })
const user2 = buildMembershipPayload({ id: 2, first_name: 'Test', last_name: 'User2', team_id: v7.id, user_id: 2 })

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [user1, user2])
})

it('matches snapshot', () => {
  const propsData = {
    actor: { role: 'annotator', user_id: user1.user_id },
    count: 2
  }
  const wrapper = shallowMount(HideByAuthorItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  const propsData = {
    actor: { role: 'annotator', user_id: user1.user_id },
    count: 2,
    selected: true
  }
  const wrapper = shallowMount(HideByAuthorItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits click when click on the root div', async () => {
  const propsData = {
    actor: { role: 'annotator', user_id: user1.user_id },
    count: 2
  }
  const wrapper = shallowMount(HideByAuthorItem, { localVue, propsData, store })
  await wrapper.find('.hide-by-author-item').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
