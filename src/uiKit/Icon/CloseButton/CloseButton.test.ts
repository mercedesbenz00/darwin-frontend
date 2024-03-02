import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import CloseButton from './CloseButton.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  variant: 'big',
  disabled: false
}

beforeEach(() => {
  wrapper = shallowMount(CloseButton, { propsData })
})

afterEach(() => {
  wrapper.destroy()
})

describe('CloseButton UI', function () {
  it('should mount correctly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should have the correct class', () => {
    expect(wrapper.find('.close-button').exists()).toBe(true)
  })

  it('should emit click event', async () => {
    wrapper.setProps({ size: 'small' })
    const button = wrapper.find('icon-button-stub')
    await button.vm.$emit('click')
    expect(button.emitted()).toHaveProperty('click')
  })
})
