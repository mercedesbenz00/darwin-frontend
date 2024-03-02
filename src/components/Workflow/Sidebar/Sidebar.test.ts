import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'

import Sidebar from './Sidebar.vue'

const pinia = createTestingPinia()
const localVue = createLocalVue()

localVue.use(PiniaVuePlugin)

it('renderes correctly', () => {
  const wrapper = shallowMount(Sidebar, { localVue, pinia })
  expect(wrapper.exists()).toBeTruthy()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Sidebar, { localVue, pinia })
  expect(wrapper).toMatchSnapshot()
})
