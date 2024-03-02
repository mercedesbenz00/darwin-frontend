import { createLocalVue, shallowMount } from '@vue/test-utils'

import Sidebar from '@/components/Admin/Sidebar.vue'

const localVue = createLocalVue()
const stubs = ['router-link']

it('matches snapshot', () => {
  const wrapper = shallowMount(Sidebar, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})
