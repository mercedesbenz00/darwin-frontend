import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import TwitterButton from '@/components/Common/Social/TwitterButton.vue'

const localVue = createLocalVue()
const stubs: Stubs = {
  ButtonTemplate: {
    template: '<twitter-button><slot></slot></twitter-button>'
  }
}

it('matches snapshot', () => {
  const wrapper = shallowMount(TwitterButton, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('checks whether default button title is Twitter', () => {
  const wrapper = shallowMount(TwitterButton, { localVue, stubs })
  expect(wrapper.text()).toContain('Twitter')
})
