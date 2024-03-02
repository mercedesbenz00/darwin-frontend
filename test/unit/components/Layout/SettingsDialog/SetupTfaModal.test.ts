import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildUserPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import SetupTfaModal from '@/components/Layout/SettingsDialog/SetupTfaModal.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: { setupRequired?: boolean }
const mocks = { $theme: createMockTheme() }
const stubs: Stubs = {
  LoginTfaForm: {
    template: `
      <div class="login-tfa-form">
        <slot name="actions" />
      </div>
    `
  },
  SetupTfaForm: {
    template: `
      <div class="setup-tfa-form">
        <slot name="actions" />
      </div>
    `
  }
}

beforeEach(() => {
  propsData = {}
  store = createTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ email: 'test@v7labs.com' }))
})

describe('when setup is required', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  describe('after secret key is loaded', () => {
    let wrapper: Wrapper<Vue>

    beforeEach(async () => {
      jest.spyOn(store, 'dispatch').mockResolvedValue({
        data: { secret_2fa: 'secret_key' }
      })

      wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
      await emitRootStub(wrapper, 'before-open')
    })

    it('matches snapshot', async () => {
      await flushPromises()
      expect(store.dispatch).toBeCalledWith('auth/setup2fa')
      expect(wrapper).toMatchSnapshot()
    })

    it('renders 2fa confirmation form on continue', async () => {
      await wrapper.find('primary-button-stub').vm.$emit('click')
      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find('.login-tfa-form').exists()).toBeTruthy()
    })

    it('goes back to setup form on back is clicked on confirmation form', async () => {
      await wrapper.find('primary-button-stub').vm.$emit('click')
      expect(wrapper.find('.login-tfa-form').exists()).toBeTruthy()
      await wrapper.find('secondary-button-stub').vm.$emit('click')
    })

    it('confirms 2fa and emits confirmed after token is provided', async () => {
      jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
      await wrapper.find('primary-button-stub').vm.$emit('click')
      await wrapper.find('.login-tfa-form').vm.$emit('update:token', '123456')
      await wrapper.find('primary-button-stub').vm.$emit('click')
      expect(store.dispatch).toBeCalledWith('auth/confirm2fa', { token: '123456' })
      await flushPromises()
      expect(wrapper.emitted().confirmed).toBeDefined()
      expect(wrapper.vm.$modal.hide).toBeCalled()
    })

    it('show error when 2fa confirmation is failed', async () => {
      jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Error' } })
      jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
      await wrapper.find('primary-button-stub').vm.$emit('click')
      await wrapper.find('.login-tfa-form').vm.$emit('update:token', '123456')
      await wrapper.find('primary-button-stub').vm.$emit('click')
      expect(store.dispatch).toBeCalledWith('auth/confirm2fa', { token: '123456' })
      await flushPromises()
      expect(wrapper.find('.confirm-tfa-form').attributes('show-error')).toBeTruthy()
    })

    it('closes modal on close', async () => {
      jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
      await wrapper.find('secondary-button-stub').vm.$emit('click')
      expect(wrapper.vm.$modal.hide).toBeCalled()
    })
  })
})

describe('when setup is not required', () => {
  beforeEach(() => {
    propsData = { setupRequired: false }
    jest.spyOn(store, 'dispatch').mockResolvedValue({})
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('confirms 2fa and emits confirmed after token is provided', async () => {
    const wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
    jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
    await wrapper.find('.login-tfa-form').vm.$emit('update:token', '123456')
    await wrapper.find('primary-button-stub').vm.$emit('click')
    expect(store.dispatch).toBeCalledWith('auth/confirm2fa', { token: '123456' })
    await flushPromises()
    expect(wrapper.emitted().confirmed).toBeDefined()
    expect(wrapper.vm.$modal.hide).toBeCalled()
  })

  it('show error when 2fa confirmation is failed', async () => {
    const wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Error' } })
    jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
    await wrapper.find('.login-tfa-form').vm.$emit('update:token', '123456')
    await wrapper.find('primary-button-stub').vm.$emit('click')
    expect(store.dispatch).toBeCalledWith('auth/confirm2fa', { token: '123456' })
    await flushPromises()
    expect(wrapper.find('.confirm-tfa-form').attributes('show-error')).toBeTruthy()
  })

  it('closes modal on close', async () => {
    const wrapper = shallowMount(SetupTfaModal, { localVue, mocks, propsData, store, stubs })
    jest.spyOn(wrapper.vm.$modal, 'hide').mockReturnValue(undefined)
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.vm.$modal.hide).toBeCalled()
  })
})
