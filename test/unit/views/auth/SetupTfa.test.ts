import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'
import SetupTfa from '@/views/auth/SetupTfa.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const stubs: Stubs = {
  SetupTfaForm: {
    template: `
      <div class="setup-tfa-form">
        <slot name="actions" />
      </div>
    `
  }
}
const mocks = {
  $route: { query: { secret_key: 'secretKey' } },
  $router: {
    push: jest.fn(),
    replace: jest.fn()
  }
}
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_2FA_CREDENTIALS', {
    email: 'test@v7labs.com',
    password: 'Password1'
  })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SetupTfa, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('if no 2fa credentials, redirect to /login', () => {
  store.commit('auth/SET_2FA_CREDENTIALS', null)
  shallowMount(SetupTfa, { localVue, mocks, store })
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('if no token in the query string, redirect to /login', () => {
  const mocks = {
    $route: { query: {} },
    $router: {
      push: jest.fn(),
      replace: jest.fn()
    }
  }
  shallowMount(SetupTfa, { localVue, mocks, store, stubs })
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('back button redirects to /login', async () => {
  const wrapper = shallowMount(SetupTfa, { localVue, mocks, store, stubs })
  await wrapper.find('secondary-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('auth/logout')
  await flushPromises()
  expect(mocks.$router.push).toBeCalledWith('/login')
})

it('continue button redirects to /login-2fa', async () => {
  const wrapper = shallowMount(SetupTfa, { localVue, mocks, store, stubs })
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(mocks.$router.push).toBeCalledWith('/login-2fa?origin=setup2fa')
})
