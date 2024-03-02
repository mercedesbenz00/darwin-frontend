import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { triggerRootStub } from 'test/unit/testHelpers'

import RegisterForm from '@/components/Auth/Register/RegisterForm.vue'
import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const mocks = {
  $ga: { event: jest.fn() },
  $route: { query: { token: 'Token' } }
}
const stubs: Stubs = { 'input-field': true }
let propsData: {
  email: string
  isTeamInvitation: boolean
  token: string
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    email: 'test@v7labs.com',
    isTeamInvitation: true,
    token: 'token'
  }
})

const models = {
  agreedToTos: 'check-box-stub#agreedToTos',
  firstName: '.register-form__first__name input-field-stub',
  lastName: '.register-form__last__name input-field-stub',
  email: '.register-form__email input-field-stub',
  password: '.register-form__password password-input-stub',
  avatarUpload: 'avatar-upload-stub'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('validation', () => {
  it('it emits ga event when user has not agreed to Terms and Conditions', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_terms_not_accepted')
    expect(store.dispatch).not.toBeCalled()
  })

  it('shows error when first name is empty', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    wrapper.find(models.agreedToTos).vm.$emit('input', true)
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.firstName).props('error')).toEqual('First Name cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_form_invalid')
  })

  it('shows error when last name is empty', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    wrapper.find(models.agreedToTos).vm.$emit('input', true)
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.lastName).props('error')).toEqual('Last Name cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_form_invalid')
  })

  it('shows error when email is empty', async () => {
    propsData.email = ''
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    wrapper.find(models.agreedToTos).vm.$emit('input', true)
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.email).props('error')).toEqual('Email cannot be empty')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_form_invalid')
  })

  it('shows error when email is invalid', async () => {
    propsData.email = 'invalid-email'
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    wrapper.find(models.agreedToTos).vm.$emit('input', true)
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.email).props('error')).toEqual('Should be the valid email')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_form_invalid')
  })

  it('shows error when password is invalid', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, mocks, propsData, store, stubs })
    wrapper.find(models.agreedToTos).vm.$emit('input', true)

    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.password).props('error')).toBeDefined()

    wrapper.find(models.password).vm.$emit('input', 'password')
    await triggerRootStub(wrapper, 'submit')
    expect(wrapper.find(models.password).props('error')).toBeDefined()
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_form_invalid')
  })
})

describe('when team registration', () => {
  let data: () => {
    firstName: string
    lastName: string
    password: string
    agreedToTos: boolean
    twoFactorAuthEnabled: boolean
  }

  beforeEach(() => {
    propsData.email = 'test@v7labs.com'
    propsData.isTeamInvitation = true
    data = () => ({
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      agreedToTos: true,
      twoFactorAuthEnabled: false
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({})
  })

  it('registers a new user', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    expect(wrapper.find('google-auth-button-stub').exists()).toBe(true)
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/register', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'success_email_confirmed')
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(wrapper.emitted().submitted).toBeDefined()
  })

  it('registers a new user with avatar', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    const avatarData: AvatarUploadData = {
      hash: 'hash',
      file: new File([''], 'foo.png', { type: 'image/jpg' }),
      type: 'image/jpg'
    }
    wrapper.find(models.avatarUpload).vm.$emit('change', avatarData)
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/register', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: 'hash',
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('user/uploadProfileAvatar', {
      content: avatarData.file,
      type: avatarData.type
    })
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'success_email_confirmed')
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(wrapper.emitted().submitted).toBeDefined()
  })

  it('shows proper validation error messages when failed during registration', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/register') {
        return {
          error: {
            code: 'registration_failed',
            isValidationError: true,
            firstName: 'first-name-error'
          }
        }
      }
      return {}
    })
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/register', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(wrapper.find(models.firstName).props('error')).toEqual('first-name-error')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_request_failed', 'registration_failed')
    expect(wrapper.emitted().submitted).not.toBeDefined()
  })

  it('shows proper error messages when failed during registration', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/register') {
        return {
          error: {
            code: 'registration_failed',
            isValidationError: false,
            message: 'Token is invalid'
          }
        }
      }
      return {}
    })
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/register', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'Token is invalid' })
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_request_failed', 'registration_failed')
    expect(wrapper.emitted().submitted).not.toBeDefined()
  })
})

describe('when confirming invitation', () => {
  let data: () => {
    firstName: string
    lastName: string
    password: string
    agreedToTos: boolean
    twoFactorAuthEnabled: boolean
  }

  beforeEach(() => {
    propsData.email = 'test@v7labs.com'
    propsData.isTeamInvitation = false
    data = () => ({
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      agreedToTos: true,
      twoFactorAuthEnabled: false
    })
  })

  it('registers a new user', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'success_email_confirmed')
    await flushPromises()
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(wrapper.emitted().submitted).toBeDefined()
  })

  it('registers a new user with avatar', async () => {
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    const avatarData: AvatarUploadData = {
      hash: 'hash',
      file: new File([''], 'foo.png', { type: 'image/jpg' }),
      type: 'image/jpg'
    }
    wrapper.find(models.avatarUpload).vm.$emit('change', avatarData)
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: 'hash',
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('user/uploadProfileAvatar', {
      content: avatarData.file,
      type: avatarData.type
    })
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'success_email_confirmed')
    expect(store.state.auth.tfaCredentials).toEqual({
      email: 'test@v7labs.com',
      password: 'Password1'
    })
    expect(wrapper.emitted().submitted).toBeDefined()
  })

  it('shows proper validation error messages when failed during registration', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/confirmInvitation') {
        return {
          error: {
            code: 'registration_failed',
            isValidationError: true,
            firstName: 'first-name-error'
          }
        }
      }
      return {}
    })
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(wrapper.find(models.firstName).props('error')).toEqual('first-name-error')
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_request_failed', 'registration_failed')
    expect(wrapper.emitted().submitted).not.toBeDefined()
  })

  it('shows proper error messages when failed during registration', async () => {
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'auth/confirmInvitation') {
        return {
          error: {
            code: 'registration_failed',
            isValidationError: false,
            message: 'Token is invalid'
          }
        }
      }
      return {}
    })
    const wrapper = shallowMount(RegisterForm, { localVue, data, mocks, propsData, store, stubs })
    await triggerRootStub(wrapper, 'submit')
    expect(store.dispatch).toBeCalledWith('auth/confirmInvitation', {
      email: 'test@v7labs.com',
      firstName: 'First',
      lastName: 'Last',
      password: 'Password1',
      hash: undefined,
      agreedToTos: true,
      twoFactorAuthEnabled: false,
      token: 'Token'
    })
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'Token is invalid' })
    expect(mocks.$ga.event).toBeCalledWith('signup', 'submit', 'failure_request_failed', 'registration_failed')
    expect(wrapper.emitted().submitted).not.toBeDefined()
  })
})
