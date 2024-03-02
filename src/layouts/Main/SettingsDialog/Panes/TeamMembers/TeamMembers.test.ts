import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildInvitationPayload,
  buildMembershipPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { SettingsPane } from 'test/unit/stubs'

import TeamMembers from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/TeamMembers.vue'
import { Ability } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

const v7 = buildTeamPayload({ id: 1 })

const teamOwnerMembership = buildMembershipPayload({
  id: 1,
  user_id: 1,
  team_id: v7.id,
  role: 'owner',
  email: 'owner@example.com',
  first_name: 'Tim',
  last_name: 'Owner'
})

const adminMembership = buildMembershipPayload({
  id: 2,
  user_id: 2,
  team_id: v7.id,
  role: 'admin',
  email: 'admin@example.com',
  first_name: 'Adele',
  last_name: 'Min'
})

const userMembership = buildMembershipPayload({
  id: 3,
  user_id: 3,
  team_id: v7.id,
  role: 'member',
  email: 'member@example.com',
  first_name: 'Mark',
  last_name: 'Ember'
})

const annotatorMembership = buildMembershipPayload({
  id: 4,
  user_id: 4,
  team_id: v7.id,
  role: 'annotator',
  email: 'annotator@example.com',
  first_name: 'Anne',
  last_name: 'Otator'
})

const memberInvitation = buildInvitationPayload({
  id: 1,
  team_id: v7.id,
  confirmed: false,
  email: 'member_invitation@example.com',
  role: 'member'
})

const annotatorInvitation = buildInvitationPayload({
  id: 2,
  team_id: v7.id,
  confirmed: false,
  email: 'annotator_invitation@example.com',
  role: 'annotator'
})

let store: ReturnType<typeof createTestStore>

const stubs: Stubs = {
  SettingsPane
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [
    teamOwnerMembership,
    adminMembership,
    userMembership,
    annotatorMembership
  ])
  store.commit('team/SET_INVITATIONS', [
    memberInvitation,
    annotatorInvitation
  ])

})

const updateInvites: Ability = { subject: 'all', actions: ['update_invitations'] }
const manageInvites: Ability = { subject: 'all', actions: ['manage_invitations'] }
const viewInvites: Ability = { subject: 'all', actions: ['view_invitations'] }
const manageMemberships: Ability = { subject: 'all', actions: ['manage_memberships'] }
const updateMembership: Ability = { subject: 'all', actions: ['update_membership'] }

beforeEach(() => {
  store.commit('auth/SET_ABILITIES', [
    manageInvites,
    manageMemberships,
    updateInvites,
    updateMembership,
    viewInvites
  ])
})

it('matches snapshot when current user cannot manage invitations', () => {
  store.commit('auth/SET_ABILITIES', [updateMembership])

  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when current user can manage invitations', () => {
  store.commit('auth/SET_ABILITIES', [updateMembership, manageInvites])
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot('can manage invitations')
})

it('loads memberships and invitations', () => {
  shallowMount(TeamMembers, { localVue, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).toHaveBeenCalledWith('team/getInvitations')
})

it('does not load invitations if no ability', () => {
  store.commit('auth/SET_ABILITIES', [])
  shallowMount(TeamMembers, { localVue, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('team/getMemberships')
  expect(store.dispatch).not.toHaveBeenCalledWith('team/getInvitations')
})

it('renders annotators and workforce managers separately from regular members', () => {
  const memberships = [
    buildMembershipPayload({ id: 1, team_id: v7.id, role: 'annotator' }),
    buildMembershipPayload({ id: 2, team_id: v7.id, role: 'member' }),
    buildMembershipPayload({ id: 3, team_id: v7.id, role: 'workforce_manager' }),
    buildMembershipPayload({ id: 4, team_id: v7.id, role: 'admin' }),
    buildMembershipPayload({ id: 5, user_id: 99, team_id: v7.id, role: 'owner' })
  ]
  store.commit('team/SET_MEMBERSHIPS', memberships)
  store.commit('team/SET_INVITATIONS', [])

  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  expect(wrapper.find('.members__memberships').findAll('member-stub').length).toEqual(3)
  expect(wrapper.find('.members__annotators').findAll('member-stub').length).toEqual(2)
})

it('updates invitation', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const id = memberInvitation.id
  const email = memberInvitation.email
  const role = 'admin'
  const params = { invitation: memberInvitation, newRole: role }
  await wrapper.findAll('invitation-stub').at(0).vm.$emit('update', params)

  expect(store.dispatch).toHaveBeenCalledWith('team/updateInvitation', { id, email, role })
})

it('updates membership (annotator -> member)', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const id = annotatorMembership.id
  const role = 'member'
  const params = { membership: annotatorMembership, newRole: role }
  await wrapper.findAll('member-stub').at(0).vm.$emit('update', params)
  expect(store.dispatch).toHaveBeenCalledWith('team/updateMembership', { id, role })
})

it('updates membership (annotator -> admin)', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const id = annotatorMembership.id
  const role = 'admin'
  const params = { membership: annotatorMembership, newRole: role }

  await wrapper.findAll('member-stub').at(0).vm.$emit('update', params)
  expect(store.dispatch).toHaveBeenCalledWith('team/updateMembership', { id, role })
})

it('updates membership (member -> admin)', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const id = userMembership.id
  const role = 'admin'
  const params = { membership: userMembership, newRole: role }

  await wrapper.findAll('member-stub').at(0).vm.$emit('update', params)
  expect(store.dispatch).toHaveBeenCalledWith('team/updateMembership', { id, role })
})

it('updates membership (member -> owner)', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const dialog = (wrapper.vm.$refs.transferOwnershipConfirmationDialog as any)
  dialog.show = jest.fn()
  dialog.close = jest.fn()

  const id = userMembership.id
  const role = 'owner'
  const params = { membership: userMembership, newRole: role }

  await wrapper.findAll('member-stub').at(0).vm.$emit('update', params)
  await wrapper.find('confirmation-dialog-stub').vm.$emit('confirmed')
  expect(store.dispatch).toHaveBeenCalledWith('team/updateMembership', { id, role })
})

it('updates membership (admin -> owner)', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const dialog = (wrapper.vm.$refs.transferOwnershipConfirmationDialog as any)
  dialog.show = jest.fn()
  dialog.close = jest.fn()

  const id = userMembership.id
  const role = 'admin'
  const params = { membership: userMembership, newRole: role }

  await wrapper.findAll('member-stub').at(0).vm.$emit('update', params)
  await wrapper.find('confirmation-dialog-stub').vm.$emit('confirmed')
  expect(store.dispatch).toHaveBeenCalledWith('team/updateMembership', { id, role })
})

it('deletes invitation', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const dialog = (wrapper.vm.$refs.deleteInvitationConfirmationDialog as any)
  dialog.show = jest.fn()
  dialog.close = jest.fn()

  const id = memberInvitation.id

  await wrapper.findAll('invitation-stub').at(0).vm.$emit('delete', memberInvitation)
  await wrapper.findAll('delete-confirmation-dialog-stub').at(1).vm.$emit('confirmed')

  expect(store.dispatch).toHaveBeenCalledWith('team/deleteInvitation', { id })
})

it('deletes membership', async () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })

  const dialog = (wrapper.vm.$refs.deleteMembershipConfirmationDialog as any)
  dialog.show = jest.fn()
  dialog.close = jest.fn()

  const id = userMembership.id

  await wrapper.findAll('member-stub').at(0).vm.$emit('delete', userMembership)
  await wrapper.findAll('delete-confirmation-dialog-stub').at(0).vm.$emit('confirmed')

  expect(store.dispatch).toHaveBeenCalledWith('team/deleteMembership', { id })
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get hasPartnerTeamMembersSection (): boolean {
    return this.wrapper.find('partner-members-stub').exists()
  }
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when regular team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7)
  })

  itMatchesSnapshot()

  it('does not render partner team members', () => {
    const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
    const model = new Model(wrapper)
    expect(model.hasPartnerTeamMembersSection).toBe(false)
  })
})

describe('when regular team', () => {
  const v7Partner = buildTeamPayload({ id: 10, managed_status: 'partner' })
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7Partner)
  })

  itMatchesSnapshot()

  it('does not render partner team members', () => {
    const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
    const model = new Model(wrapper)
    expect(model.hasPartnerTeamMembersSection).toBe(false)
  })
})

describe('when client team', () => {
  const v7Client = buildTeamPayload({ partner_id: v7.id, partner: v7, managed_status: 'client' })

  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7Client)
  })

  itMatchesSnapshot()

  it('renders partner team members', () => {
    const wrapper = shallowMount(TeamMembers, { localVue, store, stubs })
    const model = new Model(wrapper)
    expect(model.hasPartnerTeamMembersSection).toBe(true)
  })
})
