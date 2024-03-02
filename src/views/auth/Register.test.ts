import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildInvitationPayload, buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import Register from '@/views/auth/Register.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = {
  $route: { query: { token: 'token' } },
  $router: {
    push: jest.fn(),
    replace: jest.fn()
  }
}
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_INVITATION', buildInvitationPayload({
    email: 'test@v7labs.com'
  }))
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(Register, { localVue, mocks, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('if no token in the query string, redirect to /login', async () => {
  const mocks = {
    $route: { query: {} },
    $router: { replace: jest.fn() }
  }
  store.commit('auth/SET_INVITATION', null)
  shallowMount(Register, { localVue, mocks, store })
  await flushPromises()
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('when submitted, redirects to /datasets', async () => {
  const wrapper = shallowMount(Register, { localVue, mocks, store })
  await flushPromises()
  store.commit('user/SET_PROFILE', buildUserPayload({ email: 'test@v7labs.com' }))
  await wrapper.find('register-form-stub').vm.$emit('submitted')
  expect(mocks.$router.push).toBeCalledWith('/datasets')
})

it('when submitted after 2fa is enforced, redirects to /setup-2fa', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'auth/setup2fa') {
      return { data: { secret_2fa: 'SecretKey' } }
    }
    return { data: {} }
  })
  const wrapper = shallowMount(Register, { localVue, mocks, store })
  const v7 = buildTeamPayload({
    two_factor_auth_enforced: true
  })
  await flushPromises()
  store.commit('user/SET_PROFILE', buildUserPayload({
    two_factor_auth_enabled: false
  }))
  store.commit('team/SET_CURRENT_TEAM', v7)
  await wrapper.find('register-form-stub').vm.$emit('submitted')
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith(
    'toast/notify',
    { content: expect.stringContaining(v7.name) }
  )
  expect(mocks.$router.push).toBeCalledWith('/setup-2fa?secret_key=SecretKey')
})
