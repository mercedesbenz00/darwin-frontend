import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import PasswordInput from '@/components/Common/PasswordInput.vue'

const localVue = createLocalVue()

let propsData: {
  value: string
  autocomplete?: string
  error?: string
}

const stubs: Stubs = {
  'input-field': {
    template: `
      <div class="input-field-stub">
        <slot name="modifier" />
      </div>
    `
  }
}

it('matches snapshot', () => {
  propsData = { value: '' }
  const wrapper = shallowMount(PasswordInput, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with strong password', () => {
  propsData = { value: 'Password1' }
  const wrapper = shallowMount(PasswordInput, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with invalid password', async () => {
  propsData = { value: '' }
  const wrapper = shallowMount(PasswordInput, { localVue, propsData, stubs })
  await wrapper.setProps({ value: 'invalid-password' })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with error', () => {
  propsData = {
    error: 'Error',
    value: 'Password1'
  }
  const wrapper = shallowMount(PasswordInput, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
