import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import ContextMenuPopoverAssign from './ContextMenuPopoverAssign.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let wrapper: Wrapper<Vue>
let store: ReturnType<typeof initializeStore>

const propsData = {}

const clientTeam = buildTeamPayload({
  id: 4,
  name: 'Client 1',
  managed_status: 'client',
  partner_id: 3
})

const joeInClient = buildMembershipPayload({
  id: 1,
  team_id: clientTeam.id,
  first_name: 'a',
  last_name: 'a',
  user_id: 1
})
const joeInPartner = buildMembershipPayload({
  id: 2,
  team_id: clientTeam.id,
  first_name: 'b',
  last_name: 'b',
  user_id: 1
})
const mikeInClient = buildMembershipPayload({
  id: 3,
  team_id: clientTeam.id,
  first_name: 'c',
  last_name: 'c',
  user_id: 2
})
const samInPartner = buildMembershipPayload({
  id: 4,
  team_id: clientTeam.id,
  first_name: 'd',
  last_name: 'd',
  user_id: 3
})

beforeEach(() => {
  store = initializeStore()
  store.commit('team/SET_CURRENT_TEAM', clientTeam)
  store.commit('team/SET_MEMBERSHIPS', [samInPartner, joeInClient, joeInPartner, mikeInClient])
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  wrapper = shallowMount(ContextMenuPopoverAssign, {
    propsData,
    localVue,
    store
  })
  expect(wrapper.exists()).toBeTruthy()
})

it('should match snapshot', () => {
  wrapper = shallowMount(ContextMenuPopoverAssign, {
    propsData,
    localVue,
    store
  })
  expect(wrapper).toMatchSnapshot()
})

it('sorts by fullname', async () => {
  wrapper = shallowMount(ContextMenuPopoverAssign, {
    propsData,
    localVue,
    store
  })
  await expect(
    wrapper.findAll('list-element-v2-stub').at(0).attributes('text')
  ).toContain(
    joeInClient.first_name
  )
})
