import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload, buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import MemberSelection from './MemberSelection.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('close-popover', () => {})

const v7 = buildTeamPayload({ id: 1, name: 'V7', slug: 'v7' })

const sam = buildUserPayload({ id: 1, email: 'sam@v7labs.com' })
const jim = buildUserPayload({ id: 2, email: 'jim@v7labs.com' })

const samV7Member = buildMembershipPayload({
  id: 1,
  first_name: 'Sam',
  last_name: 'Annotator',
  user_id: sam.id,
  team_id: v7.id
})

const jimV7Member = buildMembershipPayload({
  id: 2,
  first_name: 'Jim',
  last_name: 'Annotator',
  user_id: jim.id,
  team_id: v7.id
})

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { VPopover }

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [samV7Member, jimV7Member])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(MemberSelection, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when search with keyword', async () => {
  const wrapper = shallowMount(MemberSelection, { localVue, store, stubs })
  wrapper.find('input-field-stub').vm.$emit('input', 'jim')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('.member-selection-item').length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})

it('emits select when you select an annotator', () => {
  const wrapper = shallowMount(MemberSelection, { localVue, store, stubs })
  wrapper.findAll('.member-selection-item').at(0).trigger('click')
  expect(wrapper.emitted().select).toEqual([[samV7Member]])
})
