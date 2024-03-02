import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { NavigationGuard, Route } from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'
import LoginTfa from '@/views/auth/LoginTfa.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const stubs: Stubs = {
  LoginTfaForm: {
    template: `
      <div class="login-tfa-form">
        <slot name="actions" />
      </div>
    `
  }
}

let store: ReturnType<typeof createTestStore>
const  currentRouteMock: Route = {
  name: 'LoginTfa',
  path: '/login-2fa',
  hash: '',
  fullPath: '/login-2fa',
  query: {},
  params: {},
  matched: []
}
const beforeEachMock: jest.Mock = jest.fn().mockImplementation((guard: NavigationGuard) => {
  guard(currentRouteMock, currentRouteMock, jest.fn())
})

const mocks = {
  $route: { query: { origin: 'setup2fa' } },
  $router: {
    push: jest.fn(),
    replace: jest.fn(),
    beforeEach: beforeEachMock,
    currentRoute: currentRouteMock
  },
  $featureEnabled: jest.fn().mockReturnValue(false)
}

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_2FA_CREDENTIALS', {
    email: 'test@v7labs.com',
    password: 'Password1'
  })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(LoginTfa, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('if no 2fa credentials, redirect to /login', () => {
  store.commit('auth/SET_2FA_CREDENTIALS', null)
  shallowMount(LoginTfa, { localVue, mocks, store })
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('dispatches auth/confirm2fa, when the previous page was setup', async () => {
  const wrapper = shallowMount(LoginTfa, { localVue, mocks, store, stubs })
  await wrapper.find('div.login-tfa-form').vm.$emit('update:token', '123456')
  await wrapper.find('div.login-tfa-form').vm.$emit('confirm')
  expect(store.dispatch).toBeCalledWith('auth/confirm2fa', {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  })
  await flushPromises()
  expect(mocks.$router.push).toBeCalledWith('/datasets')
  expect(store.state.auth.tfaCredentials).toBeNull()
})

it('dispatches auth/login2fa, when the previous page was login', async () => {
  mocks.$route.query.origin = 'login'
  const wrapper = shallowMount(LoginTfa, { localVue, mocks, store, stubs })
  await wrapper.find('div.login-tfa-form').vm.$emit('update:token', '123456')
  await wrapper.find('div.login-tfa-form').vm.$emit('confirm')
  expect(store.dispatch).toBeCalledWith('auth/login2fa', {
    email: 'test@v7labs.com',
    password: 'Password1',
    token: '123456'
  })
  await flushPromises()
  expect(mocks.$router.push).toBeCalledWith('/datasets')
  expect(store.state.auth.tfaCredentials).toBeNull()
})
