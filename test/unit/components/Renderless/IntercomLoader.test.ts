import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildImagePayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import IntercomLoader from '@/components/Renderless/IntercomLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = {
  $intercom: {
    boot: jest.fn(),
    isBooted: false,
    once: jest.fn().mockImplementation((state: string, callback: () => void) => {
      callback()
    }),
    shutdown: jest.fn(),
    update: jest.fn()
  },
  $theme: createMockTheme()
}
const stubs = ['router-view']
let store: ReturnType<typeof createTestStore>

const superuser = buildUserPayload({
  id: 1,
  first_name: 'First',
  last_name: 'Last',
  email: 'unit@test.com',
  image: buildImagePayload({ thumbnail_url: 'foo.jpg' }),
  superuser: true
})
const superuserMembership = buildMembershipPayload({
  id: 1,
  team_id: 1,
  user_id: superuser.id,
  role: 'admin'
})

const normaluser = buildUserPayload({
  id: 2,
  first_name: 'First',
  last_name: 'Last',
  email: 'unit@test.com'
})
const normaluserMembership = buildMembershipPayload({
  id: 2,
  team_id: 2,
  user_id: normaluser.id,
  role: 'member'
})

const currentteamuser = buildUserPayload({
  id: 3,
  first_name: 'Other',
  last_name: 'User',
  email: 'other@test.com'
})
const currentteamuserMembership = buildMembershipPayload({
  id: 3,
  team_id: 1,
  user_id: currentteamuser.id,
  role: 'owner'
})

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_MEMBERSHIPS', [
    superuserMembership,
    normaluserMembership,
    currentteamuserMembership
  ])
})

describe('intercom integrations', () => {
  it('boots the intercom once it is ready', async () => {
    const wrapper = shallowMount(IntercomLoader, { localVue, mocks, store, stubs })
    store.commit('auth/SET_AUTHENTICATED', true)
    await wrapper.vm.$nextTick()
    expect(mocks.$intercom.once).toBeCalled()
  })

  it('boots the intercom when logged in', async () => {
    const wrapper = shallowMount(IntercomLoader, { localVue, mocks, store, stubs })
    store.commit('auth/SET_AUTHENTICATED', true)
    await wrapper.vm.$nextTick()
    expect(mocks.$intercom.boot).toBeCalledWith({
      hide_default_launcher: true,
      custom_launcher_selector: '#feedback-trigger',
      alignment: 'left'
    })
  })

  it('shutdown the intercom when logged out', async () => {
    const wrapper = shallowMount(IntercomLoader, { localVue, mocks, store, stubs })
    store.commit('auth/SET_AUTHENTICATED', false)
    await wrapper.vm.$nextTick()
    expect(mocks.$intercom.shutdown).toBeCalled()
  })

  it('pass the right ui custom information to intercom', () => {
    store.commit('user/SET_PROFILE', superuser)
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })
    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      horizontal_padding: 260
    }))
  })

  it('pass the right horizontal padding when the sidebar is minimized', () => {
    store.commit('user/SET_PROFILE', superuser)
    store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })
    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      horizontal_padding: 80
    }))
  })

  it('pass the right information to intercom from superuser profile', () => {
    store.commit('user/SET_PROFILE', superuser)
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      email: 'unit@test.com',
      name: 'First Last',
      avatar: { type: 'avatar', image_url: 'foo.jpg' },
      inserted_at: '',
      show_notifications: true,
      superuser: true,
      tutorial_seen: false
    }))
  })

  it('pass the right information to intercom from normal user without avatar', () => {
    store.commit('user/SET_PROFILE', normaluser)
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      email: 'unit@test.com',
      name: 'First Last',
      inserted_at: '',
      show_notifications: true,
      superuser: false,
      tutorial_seen: false
    }))
  })

  it('pass the right company to intercom from team', () => {
    store.commit('user/SET_PROFILE', normaluser)
    const team = buildTeamPayload({
      id: 1,
      name: 'Team 1',
      members: [buildMembershipPayload({ user_id: normaluser.id, role: 'admin' })]
    })
    store.commit('team/SET_CURRENT_TEAM', team)

    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      company: expect.objectContaining({
        company_id: '1',
        name: 'Team 1',
        created_at: (new Date(team.inserted_at).getTime() / 1000),
        size: 1
      })
    }))
  })
})

describe('pass the right team_role to intercom', () => {
  it('pass admin if you have admin role', () => {
    store.commit('user/SET_PROFILE', normaluser)
    store.commit('team/SET_MEMBERSHIPS', [
      superuserMembership,
      normaluserMembership,
      currentteamuserMembership
    ])
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      team_role: 'admin'
    }))
  })

  it('pass user if you have member role', () => {
    store.commit('user/SET_PROFILE', normaluser)
    store.commit('team/SET_MEMBERSHIPS', [normaluserMembership, currentteamuserMembership])
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(expect.objectContaining({
      team_role: 'user'
    }))
  })
})

describe('when billing info is not freemium', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', buildBillingInfoPayload({ freemium: false }))
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'V7' }))
  })
  it('pass freemimum false to intercom', () => {
    store.commit('user/SET_PROFILE', normaluser)
    store.commit('team/SET_MEMBERSHIPS', [normaluserMembership, currentteamuserMembership])
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(
      expect.objectContaining({
        company: expect.objectContaining(
          { custom_attributes: expect.objectContaining({ freemium: false }) }
        )
      })
    )
  })
})

describe('when billing info is freemium', () => {
  beforeEach(() => {
    store.commit('billing/SET_BILLING_INFO', buildBillingInfoPayload({ freemium: true }))
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'V7' }))
  })

  it('pass freemium true to intercom', () => {
    store.commit('user/SET_PROFILE', normaluser)
    store.commit('team/SET_MEMBERSHIPS', [normaluserMembership, currentteamuserMembership])
    shallowMount(IntercomLoader, { localVue, mocks, store, stubs })

    expect(mocks.$intercom.update).toBeCalledWith(
      expect.objectContaining({
        company: expect.objectContaining(
          { custom_attributes: expect.objectContaining({ freemium: true }) }
        )
      })
    )
  })
})
