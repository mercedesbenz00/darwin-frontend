import { createLocalVue, shallowMount } from '@vue/test-utils'

import RegisterTeaser from '@/components/Auth/Register/RegisterTeaser.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterTeaser, { localVue })
  expect(wrapper).toMatchSnapshot()
})
