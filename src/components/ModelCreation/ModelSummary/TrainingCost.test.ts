import { createLocalVue, shallowMount } from '@vue/test-utils'

import TrainingCost from '@/components/ModelCreation/ModelSummary/TrainingCost.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(TrainingCost, { localVue })
  expect(wrapper).toMatchSnapshot()
})
