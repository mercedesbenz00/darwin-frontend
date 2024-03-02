import { createLocalVue, shallowMount } from '@vue/test-utils'

import IouTooltip from '@/components/DatasetSettings/Stage/IouTooltip.vue'
const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(IouTooltip, { localVue })
  expect(wrapper).toMatchSnapshot()
})
