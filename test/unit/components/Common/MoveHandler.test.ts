import { createLocalVue, shallowMount } from '@vue/test-utils'

import MoveHandler from '@/components/Common/MoveHandler.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(MoveHandler, { localVue })
  expect(wrapper).toMatchSnapshot()
})
