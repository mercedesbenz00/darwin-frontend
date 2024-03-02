import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildMembershipPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { SettingsPane } from 'test/unit/stubs'

import TeamSso from '@/layouts/Main/SettingsDialog/Panes/TeamSso.vue'
import { installCommonComponents } from '@/plugins/components'
import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const model = {
  configureButton: '[id="saml__configure"] secondary-button-stub',
  ssoEnforcedCheckBox: '.team__body__sso [id="ssoAuthEnforced"]',
  upgradeTfaButton: '.team__body__sso upgrade-tfa-icon-stub',
  businessDomainInput: '.setting__sub-cell [id="businessDomain"]'
}

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

const v7NotAllowedSSO = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00'
})
const v7AllowedSSO = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00',
  enforcing_sso_allowed: true,
  sso_enforced: true
})

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { SettingsPane }
let mocks: {
  $can: Function,
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}

let propsData: {
  twoFactorAuthEnforced: boolean
  ssoAuthEnforced: boolean
  currentPlan: string
}

let owner: MembershipPayload
let member: MembershipPayload

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

  mocks = {
    $can: jest.fn().mockImplementation((action) => {
      return action !== 'manage_client_team'
    }),
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }

  propsData = {
    twoFactorAuthEnforced: false,
    ssoAuthEnforced: false,
    currentPlan: ''
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

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
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
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
    propsData = {
      twoFactorAuthEnforced: true,
      ssoAuthEnforced: false,
      currentPlan: ''
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when SSO enforcement is not allowed', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7NotAllowedSSO)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('should not allow to configure SSO', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.configureButton).attributes('disabled'))
      .toBe('true')
  })

  it('should not allow to enforce SSO', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.ssoEnforcedCheckBox).attributes('disabled'))
      .toBe('true')
  })

  it('should render upgrade tfa button', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.upgradeTfaButton).exists()).toBeTruthy()
  })

  it('should not allow to input business domain with none enterprise credit', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.businessDomainInput).attributes('disabled'))
      .toBe('true')
  })

  it('should allow to input business domain with enterprise credit', async () => {
    propsData.currentPlan = 'enterprise'

    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    await flushPromises()

    expect(wrapper.find(model.businessDomainInput).attributes('disabled'))
      .not.toBe('true')
  })
})

describe('when SSO enforcement is allowed', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7AllowedSSO)
    propsData = {
      twoFactorAuthEnforced: false,
      ssoAuthEnforced: true,
      currentPlan: 'enterprise'
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('should allow to configure SSO', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.configureButton).attributes('disabled'))
      .toBeFalsy()
  })

  it('should allow to input business domain', () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })
    expect(wrapper.find(model.businessDomainInput).attributes('disabled'))
      .toBeFalsy()
  })

  it('should allow to enforce SSO only with existing config', async () => {
    const wrapper = shallowMount(TeamSso, { localVue, store, stubs, mocks, propsData })

    expect(wrapper.find(model.ssoEnforcedCheckBox).attributes('disabled'))
      .toBe('true')
    store.commit('sso/SET_CONFIG', 'config')
    await wrapper.vm.$nextTick()
    expect(wrapper.find(model.ssoEnforcedCheckBox).attributes('disabled'))
      .toBeFalsy()
  })
})
