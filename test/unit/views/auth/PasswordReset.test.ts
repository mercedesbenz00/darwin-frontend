import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'
import PasswordReset from '@/views/auth/PasswordReset.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const mocks = {
  $route: { query: { token: 'token' } },
  $router: { push: jest.fn() }
}
const stubs: Stubs = { 'password-change': true }

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot', async () => {
  const wrapper = shallowMount(PasswordReset, { localVue, mocks, store, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('shows right error message after failed password reset', async () => {
  const wrapper = shallowMount(PasswordReset, { localVue, mocks, store, stubs })
  const errorPayload = { password: 'Password Error' }
  await flushPromises()

  const component = wrapper.vm as any
  component.$refs.passwordChange.setErrors = jest.fn()
  component.$refs.passwordChange.validateForm = jest.fn().mockReturnValue(true)

  wrapper.find('password-change-stub').vm.$emit('update:password', 'StrongPassword1')
  wrapper.find('password-change-stub').vm.$emit('update:password-confirmation', 'StrongPassword1')

  store.dispatch = jest.fn().mockResolvedValue({ error: errorPayload })
  wrapper.find('form').trigger('submit')
  await flushPromises()

  expect(component.$refs.passwordChange.setErrors).toHaveBeenCalledWith(errorPayload)
})

it('shows toast after successful password reset', async () => {
  const wrapper = shallowMount(PasswordReset, { localVue, mocks, store, stubs })
  await flushPromises()

  const component = wrapper.vm as any
  component.$refs.passwordChange.validateForm = jest.fn().mockReturnValue(true)

  wrapper.find('password-change-stub').vm.$emit('update:password', 'StrongPassword1')
  wrapper.find('password-change-stub').vm.$emit('update:password-confirmation', 'StrongPassword1')

  wrapper.find('form').trigger('submit')
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('toast/notify', { content: 'Your password has been updated' })
  expect(mocks.$router.push).toBeCalledWith('/datasets')
})
