import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import SetupTfaForm from '@/components/Auth/TwoFactorAuthentication/SetupTfaForm.vue'

const localVue = createLocalVue()
let propsData: {
  email: string
  secretKey: string
}
let slots = {}
const mocks = { $theme: createMockTheme() }

beforeEach(() => {
  propsData = {
    email: 'test@v7labs.com',
    secretKey: 'secret-key'
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(SetupTfaForm, { localVue, mocks, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

describe('without slot', () => {
  itMatchesSnapshot()
})

describe('with slot', () => {
  beforeEach(() => {
    slots = {
      actions: 'Actions slot'
    }
  })

  itMatchesSnapshot()
})
