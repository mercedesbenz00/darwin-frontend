import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import PasswordChange from '@/components/Auth/PasswordChange.vue'

const localVue = createLocalVue()

let propsData: {
  password: string
  passwordConfirmation: string
  requireOldPassword?: boolean
  oldPassword?: string
}
const stubs: Stubs = {
  'input-field': true
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

beforeEach(() => {
  propsData = {
    password: '',
    passwordConfirmation: '',
    requireOldPassword: true
  }
})

describe('with default props', () => {
  beforeEach(() => {
    propsData = {
      password: '',
      passwordConfirmation: ''
    }
  })

  itMatchesSnapshot()
})

describe('with old password form', () => {
  itMatchesSnapshot()
})

describe('validateForm method', () => {
  it('shows validation error when password is invalid', async () => {
    const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
    const component = wrapper.vm as any
    component.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('password-input-stub').props('error')).toEqual('Please type in a password')
  })

  it('shows validation error when confirm password is empty', async () => {
    propsData = {
      password: 'Password1',
      passwordConfirmation: '',
      requireOldPassword: true
    }
    const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
    const component = wrapper.vm as any
    component.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.findAll('input-field-stub').at(1).props('error')).toEqual('Confirm password cannot be empty')
  })

  it('shows validation error when confirm password is not equal to password', async () => {
    propsData = {
      password: 'Password1',
      passwordConfirmation: 'Password2',
      requireOldPassword: true
    }
    const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
    const component = wrapper.vm as any
    component.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.findAll('input-field-stub').at(1).props('error')).toEqual('You must enter the same password')
  })
})

describe('setErrors method', () => {
  it('sets proper errors', () => {
    const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
    const component = wrapper.vm as any
    component.setErrors({
      oldPassword: 'old-password-error',
      password: 'password-error',
      passwordConfirmation: 'password-confirmation-error'
    })
    expect(wrapper).toMatchSnapshot()
  })
})

it('emits updated oldPassword', async () => {
  const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
  await wrapper.findAll('input-field-stub').at(0).vm.$emit('input', 'old-password')
  expect(wrapper.emitted()['update:old-password']).toEqual([['old-password']])
})

it('emits updated password', async () => {
  const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
  await wrapper.find('password-input-stub').vm.$emit('input', 'new-password')
  expect(wrapper.emitted()['update:password']).toEqual([['new-password']])
})

it('emits updated passwordConfirmation', async () => {
  const wrapper = shallowMount(PasswordChange, { localVue, propsData, stubs })
  await wrapper.findAll('input-field-stub').at(1).vm.$emit('input', 'confirm-password')
  expect(wrapper.emitted()['update:password-confirmation']).toEqual([['confirm-password']])
})
