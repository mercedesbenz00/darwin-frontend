import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import TeamOwnerInvitationList from '@/components/Admin/TeamOwnerInvitations/TeamOwnerInvitationList.vue'
import { installCommonComponents } from '@/plugins/components'
import { TeamOwnerInvitation } from '@/store/modules/admin/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const stubs: Stubs = {
  'router-link': true
}

it('matches snapshot when user invitation list is empty', () => {
  const wrapper = shallowMount(TeamOwnerInvitationList, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when team owner invitations loaded', () => {
  const teamOwnerInvitation1: TeamOwnerInvitation = {
    id: 1,
    email: 'user1@example.com',
    team: null,
    creditAmount: 1234000,
    creditExpirationInDays: 2
  }
  const teamOwnerInvitation2: TeamOwnerInvitation = {
    id: 2,
    email: 'user2@example.com',
    team: { id: 1, name: 'TEAM' },
    creditAmount: 1234000,
    creditExpirationInDays: 2
  }

  store.commit('admin/SET_TEAM_OWNER_INVITATIONS', [teamOwnerInvitation1, teamOwnerInvitation2])
  const wrapper = shallowMount(TeamOwnerInvitationList, { localVue, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('sets initial credit amount', () => {
  const wrapper = shallowMount(TeamOwnerInvitationList, { localVue, store, stubs })
  expect(wrapper.findAll('input-field-stub').at(1).props('value')).toEqual(20)
  expect(wrapper.findAll('input-field-stub').at(2).props('value')).toEqual(14)
})
