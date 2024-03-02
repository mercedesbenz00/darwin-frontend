import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'
import { SettingsPane } from 'test/unit/stubs'

import TeamProfile from '@/layouts/Main/SettingsDialog/Panes/TeamProfile.vue'
import { installCommonComponents } from '@/plugins/components'
import { ProductType } from '@/store/modules/billing/types'
import { MembershipPayload } from '@/store/types'
import { dateFromUtcISO } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

let info: ReturnType<typeof buildBillingInfoPayload>

const v7 = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00'
})

const v7NotAllowed2fa = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00'
})

const v7Allowed2fa = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00',
  enforcing_two_factor_auth_allowed: true
})
const v7AllowedSSO = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00',
  enforcing_sso_allowed: true,
  sso_enforced: true
})

const model = {
  teamSSO: 'team-sso-stub',
  editPlanModal: 'edit-plan-modal-stub',
  teamNameInput: 'input-field-stub[name="teamName"]',
  avatarUpload: 'avatar-upload-stub',
  form: 'form',
  deleteTeamButton: 'button.team__delete__title',
  deleteConfirmationDialog: 'delete-confirmation-dialog-stub'
}
let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { SettingsPane }
let mocks: {
  $can: Function,
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}

let owner: MembershipPayload
let member: MembershipPayload

const periodEnd = Math.floor(
  dateFromUtcISO('2030-05-05T00:00:00').getTime() / 1000
)

// month earlier
const periodStart = periodEnd - (30 * 24 * 3600)

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)

  owner = buildMembershipPayload({
    id: 1,
    email: 'owner@v7labs.com',
    team_id: v7.id,
    role: 'owner',
    user_id: 1
  })

  member = buildMembershipPayload({
    id: 2,
    email: 'member@v7labs.com',
    team_id: v7.id,
    role: 'member',
    user_id: 2
  })

  store.commit('team/SET_MEMBERSHIPS', [owner, member])

  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_period_end: periodEnd,
      stripe_subscription_period_start: periodStart
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_standard_max_in_period_at: periodStart,
      annotation_credits_used: 111
    })
  })
  store.commit('billing/SET_BILLING_INFO', info)

  mocks = {
    $can: jest.fn().mockImplementation((action) => {
      return action !== 'manage_client_team'
    }),
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

describe('when partner', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', { ...v7, managed_status: 'partner' })
    mocks.$can = jest.fn().mockReturnValue(true)
  })

  itMatchesSnapshot()
})

describe('when cannot update team', () => {
  beforeEach(() => {
    mocks.$can = jest.fn().mockReturnValue(false)
  })

  itMatchesSnapshot()

  it('hides TeamSSO setting', () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    expect(wrapper.find(model.teamSSO).exists()).toBe(false)
  })
})

describe('when 2fa enforcement is not allowed', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7NotAllowed2fa)
    owner = buildMembershipPayload({
      id: 1,
      email: 'owner@v7labs.com',
      team_id: v7NotAllowed2fa.id,
      role: 'owner',
      user_id: 1
    })
    member = buildMembershipPayload({
      id: 2,
      email: 'member@v7labs.com',
      team_id: v7NotAllowed2fa.id,
      role: 'member',
      user_id: 2
    })
    store.commit('team/SET_MEMBERSHIPS', [owner, member])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    expect(wrapper).toMatchSnapshot()
  })

  it('opens edit plan modal and submits new amount', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    await wrapper.find(model.teamSSO).vm.$emit('upgrade-to-enterprise')
    expect(mocks.$modal.show).toBeCalledWith(ProductType.AnnotationCredits)
    await wrapper.find(model.editPlanModal).vm.$emit('submit', 100)

    await flushPromises()
    expect(store.dispatch).not.toBeCalledWith('team/getTeam', v7NotAllowed2fa.id)
  })

  it('opens edit plan modal and submits new amount and reload team if enterprise', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    await wrapper.find(model.teamSSO).vm.$emit('upgrade-to-enterprise')
    expect(mocks.$modal.show).toBeCalledWith(ProductType.AnnotationCredits)
    await wrapper.find(model.editPlanModal).vm.$emit('submit', 3500)

    await flushPromises()
    expect(store.dispatch).toBeCalledWith('team/getTeam', v7NotAllowed2fa.id)
  })

  it('submit with right avatar data while saving updated data', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    const avatarData = { hash: 'hash', file: new File([], 'file.png'), type: 'image/png' }
    await wrapper.find(model.teamNameInput).vm.$emit('input', 'New name')
    await wrapper.find(model.avatarUpload).vm.$emit('change', avatarData)
    await wrapper.find(model.form).trigger('submit')
    expect(store.dispatch).toBeCalledWith('team/updateTeam', {
      id: v7NotAllowed2fa.id,
      name: 'New name',
      disable_dataset_sharing: false,
      hash: avatarData.hash,
      content: avatarData.file,
      type: avatarData.type,
      two_factor_auth_enforced: false,
      sso_enforced: false
    })
  })

  it('disable avatar upload while uploading', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    const avatarData = { hash: 'hash', file: new File([], 'file.png'), type: 'image/png' }
    wrapper.find(model.avatarUpload).vm.$emit('change', avatarData)
    wrapper.find(model.form).trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('deletes team', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })

    expect(wrapper.find(model.deleteTeamButton).text()).toContain('Delete team')
    await wrapper.find(model.deleteTeamButton).trigger('click')
    expect(mocks.$modal.show).toBeCalledWith('delete-team-dialog')

    wrapper.find(model.deleteConfirmationDialog).vm.$emit('confirmed')
    expect(store.dispatch).toBeCalledWith('team/deleteTeam', v7NotAllowed2fa)
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('auth/logout')
  })

  it('leaves team', async () => {
    mocks.$can = jest.fn().mockReturnValue(false)
    store.commit('user/SET_PROFILE', buildUserPayload({ id: member.user_id }))
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })

    expect(wrapper.find(model.deleteTeamButton).text()).toContain('Leave V7')
    await wrapper.find(model.deleteTeamButton).trigger('click')
    expect(mocks.$modal.show).toBeCalledWith('delete-team-dialog')

    wrapper.find(model.deleteConfirmationDialog).vm.$emit('confirmed')
    expect(store.dispatch).toBeCalledWith('team/leaveTeam', { membershipId: member.user_id })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('auth/logout')
  })
})

describe('when 2fa enforcement is allowed', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7Allowed2fa)
    owner = buildMembershipPayload({
      id: 1,
      email: 'owner@v7labs.com',
      team_id: v7Allowed2fa.id,
      role: 'owner',
      user_id: 1
    })
    member = buildMembershipPayload({
      id: 2,
      email: 'member@v7labs.com',
      team_id: v7Allowed2fa.id,
      role: 'member',
      user_id: 2
    })
    store.commit('team/SET_MEMBERSHIPS', [owner, member])

    info.customer_subscription!.annotation_credits_standard = 3500
    store.commit('billing/SET_BILLING_INFO', info)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('Configure SSO', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7AllowedSSO)
  })

  it('should trigger configure modal when configure sso', async () => {
    const wrapper = shallowMount(TeamProfile, { localVue, store, stubs, mocks })
    const spy = jest.spyOn(wrapper.vm.$modal, 'show')
    await wrapper.find(model.teamSSO).vm.$emit('open-sso-config')

    expect(spy).toHaveBeenCalledWith('ssoConfig')
  })
})
