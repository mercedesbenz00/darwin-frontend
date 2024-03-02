import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import IconButton from '@/components/Common/Button/V1/IconButton.vue'

const localVue = createLocalVue()

const stubs: Stubs = { 'router-link': true }

it('matches snapshot', () => {
  const wrapper = shallowMount(IconButton, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when to is defined', () => {
  const propsData = { to: '/foo' }
  const wrapper = shallowMount(IconButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
