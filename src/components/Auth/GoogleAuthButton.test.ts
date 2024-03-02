import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import GoogleAuthButton from '@/components/Auth/GoogleAuthButton.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let propsData: {
  isRegister: boolean
  isDisabled: boolean
  token: string
}

const model = {
  googleAuthDiv: '#g_id_onload',
  googleAttrDiv: 'div.g_id_signin',
  googleDisabledBtn: 'secondary-button-stub.btn-google'
}

beforeEach(() => {
  propsData = {
    isRegister: false,
    isDisabled: false,
    token: 'token'
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', async () => {
  const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('adds script tag to the document', () => {
  jest.spyOn(document.body, 'appendChild')
  shallowMount(GoogleAuthButton, { localVue, propsData })
  expect(document.body.appendChild).toBeCalledWith(
    expect.objectContaining({
      src: 'https://accounts.google.com/gsi/client'
    })
  )
})

it('assigns correct redirect attribute to button', () => {
  const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
  expect(wrapper.find(model.googleAuthDiv).attributes()['data-login_uri']).toBe(
    'https://darwin.v7labs.com/api/users/authenticate/sso/oauth/google/validate')
})

describe('when logins', () => {
  beforeEach(() => {
    propsData.isRegister = false
    propsData.isDisabled = false
    propsData.token = ''
  })

  it('shows "Sign in with Google" on button', () => {
    const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
    expect(wrapper.find(model.googleAttrDiv).attributes()['data-text']).toBe('signin_with')
  })
})

describe('when registers', () => {
  beforeEach(() => {
    propsData.isRegister = true
    propsData.isDisabled = false
    propsData.token = 'token'
  })

  it('shows "Sign up with Google" on button', () => {
    const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
    expect(wrapper.find(model.googleAttrDiv).attributes()['data-text']).toBe('signup_with')
  })

  it('set token', () => {
    const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
    expect(wrapper.find(model.googleAuthDiv).attributes()['data-nonce']).toBe('token')
  })

  it('when disabled', () => {
    propsData.isDisabled = true
    const wrapper = shallowMount(GoogleAuthButton, { localVue, propsData })
    expect(wrapper.find(model.googleAttrDiv).classes()).toContain('hide')
    expect(wrapper.find(model.googleDisabledBtn).classes()).not.toContain('hide')
  })
})
