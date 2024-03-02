import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { NavigationGuard, Route } from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildInvitationPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import * as utils from '@/utils'
import Login from '@/views/auth/Login.vue'

jest.mock('@/utils/token')

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let mocks: {
  $ga: { event: jest.Mock },
  $route: { params: {}, query: {} },
  $router: {
    push: jest.Mock,
    beforeEach: jest.Mock,
    currentRoute: Route
  },
  $featureEnabled: Function
}
let store: ReturnType<typeof createTestStore>
let beforeEachMock: jest.Mock
let currentRouteMock: Route
beforeEach(() => {
  store = createTestStore()
  currentRouteMock = {
    name: 'Login',
    path: '/login',
    hash: '',
    fullPath: '/login',
    query: {},
    params: {},
    matched: []
  }
  beforeEachMock = jest.fn().mockImplementation((guard: NavigationGuard) => {
    guard(currentRouteMock, currentRouteMock, jest.fn())
  })
  jest.spyOn(utils, 'getToken').mockReturnValue(null)
})

describe('without invitation', () => {
  beforeEach(() => {
    mocks = {
      $ga: { event: jest.fn() },
      $route: { params: {}, query: {} },
      $router: {
        push: jest.fn(),
        beforeEach: beforeEachMock,
        currentRoute: currentRouteMock
      },
      $featureEnabled: jest.fn().mockReturnValue(false)
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('submits the form and redirect to /datasets', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      data: {}
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="email"]').vm.$emit('input', 'test@v7labs.com')
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/login', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false
    })
    await flushPromises()
    expect(wrapper.find('google-auth-button-stub').exists()).toBe(true)
    expect(mocks.$ga.event).toBeCalledWith('login', 'submit', 'success')
    expect(mocks.$router.push).toBeCalledWith('/datasets')
  })

  it('submits the form and redirect to /login-2fa screen', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      data: {
        required_2fa: true,
        set_up_2fa: true
      }
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="email"]').vm.$emit('input', 'test@v7labs.com')
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/login', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false
    })
    await flushPromises()
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(mocks.$router.push).toBeCalledWith('/login-2fa?origin=login')
  })

  it('submits the form and redirect to /setup-2fa screen', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/login') {
        return {
          data: {
            required_2fa: true,
            set_up_2fa: false
          }
        }
      }
      if (action === 'auth/setup2fa') {
        return { data: { secret_2fa: 'secretKey' } }
      }
      return { data: {} }
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="email"]').vm.$emit('input', 'test@v7labs.com')
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/login', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false
    })
    await flushPromises()
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    await flushPromises()
    expect(mocks.$router.push).toBeCalledWith('/setup-2fa?secret_key=secretKey')
  })

  it('dispatches toast on error received from SSO', () => {
    mocks.$route.query = { error_message: 'SSO error' }
    shallowMount(Login, { localVue, mocks, store })
    expect(store.dispatch).toBeCalledWith('toast/warning', {
      content: decodeURIComponent('SSO error')
    })
  })
})

describe('with invitation', () => {
  beforeEach(() => {
    store.commit('auth/SET_INVITATION', buildInvitationPayload({
      email: 'test@v7labs.com'
    }))
    mocks = {
      $ga: { event: jest.fn() },
      $route: {
        params: {},
        query: { token: 'invitation-token' }
      },
      $router: {
        push: jest.fn(),
        beforeEach: beforeEachMock,
        currentRoute: currentRouteMock
      },
      $featureEnabled: jest.fn().mockReturnValue(false)
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('submits the form and redirect to /datasets', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      data: {}
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false,
      token: 'invitation-token'
    })
    await flushPromises()
    expect(wrapper.find('google-auth-button-stub').exists()).toBe(true)
    expect(mocks.$ga.event).toBeCalledWith('login', 'submit', 'success')
    expect(mocks.$router.push).toBeCalledWith('/datasets')
  })

  it('submits the form and redirect to /login-2fa screen', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      data: {
        required_2fa: true,
        set_up_2fa: true
      }
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false,
      token: 'invitation-token'
    })
    await flushPromises()
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(mocks.$router.push).toBeCalledWith('/login-2fa?origin=login')
  })

  it('submits the form and redirect to /setup-2fa screen', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/confirmInvitation') {
        return {
          data: {
            required_2fa: true,
            set_up_2fa: false
          }
        }
      }
      if (action === 'auth/setup2fa') {
        return { data: { secret_2fa: 'secretKey' } }
      }
      return { data: {} }
    })
    const wrapper = shallowMount(Login, { localVue, mocks, store })
    await wrapper.find('input-field-stub[name="password"]').vm.$emit('input', 'Password1')
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      password: 'Password1',
      rememberMe: false,
      token: 'invitation-token'
    })
    await flushPromises()
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    await flushPromises()
    expect(mocks.$router.push).toBeCalledWith('/setup-2fa?secret_key=secretKey')
  })
})
