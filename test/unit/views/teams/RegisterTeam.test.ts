import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import RegisterTeam from '@/views/teams/RegisterTeam.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: { query: { token: String } },
  $router: { replace: (path: String) => void }
}

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $route: { query: { token: 'token' } },
    $router: { replace: jest.fn() }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterTeam, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when token is empty', () => {
  beforeEach(() => {
    mocks.$route.query.token = ''
  })

  it('shows error toast and redirect to login page if this is the first team', () => {
    store.commit('team/SET_TEAMS', [])
    shallowMount(RegisterTeam, { localVue, mocks, store })
    expect(mocks.$router.replace).toBeCalledWith('/')
  })

  it('redirect to login page if this is not the first team', () => {
    store.commit('team/SET_TEAMS', [buildTeamPayload({})])
    shallowMount(RegisterTeam, { localVue, mocks, store })
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: expect.any(String) })
    expect(mocks.$router.replace).toBeCalledWith('/')
  })
})

it('when token is valid', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'auth/verifyTeamOwnerInvitation') {
      return { data: { fulfilled: false } }
    }
    return {}
  })
  shallowMount(RegisterTeam, { localVue, mocks, store })
  expect(store.dispatch).toBeCalledWith('auth/verifyTeamOwnerInvitation', 'token')
  await flushPromises()
  expect(mocks.$router.replace).not.toBeCalled()
})

it('when token is valid but used before', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'auth/verifyTeamOwnerInvitation') {
      return { data: { fulfilled: true } }
    }
    return {}
  })
  shallowMount(RegisterTeam, { localVue, mocks, store })
  expect(store.dispatch).toBeCalledWith('auth/verifyTeamOwnerInvitation', 'token')
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'Invitation has already been used' })
  expect(mocks.$router.replace).toBeCalledWith('/')
})

it('when token validation fails', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'auth/verifyTeamOwnerInvitation') {
      return { error: { message: 'Failed' } }
    }
    return {}
  })
  shallowMount(RegisterTeam, { localVue, mocks, store })
  expect(store.dispatch).toBeCalledWith('auth/verifyTeamOwnerInvitation', 'token')
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'Failed' })
  expect(mocks.$router.replace).toBeCalledWith('/')
})

it('logout button logs you out', async () => {
  const wrapper = shallowMount(RegisterTeam, { localVue, mocks, store })
  await wrapper.find('.logins__link').trigger('click')
  expect(store.dispatch).toBeCalledWith('auth/logout')
  await flushPromises()
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('redirect to Register Members page after successful registration', async () => {
  const wrapper = shallowMount(RegisterTeam, { localVue, mocks, store })
  await wrapper.find('register-team-form-stub').vm.$emit('submitted')
  expect(mocks.$router.replace).toBeCalledWith('/register-members')
})
