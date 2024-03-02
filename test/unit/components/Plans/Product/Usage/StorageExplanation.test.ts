import { createLocalVue, shallowMount } from '@vue/test-utils'

import StorageExplanation from '@/components/Plans/Product/Usage/StorageExplanation.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(StorageExplanation, { localVue })
  expect(wrapper).toMatchSnapshot()
})
