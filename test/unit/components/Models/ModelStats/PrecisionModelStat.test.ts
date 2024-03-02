import { shallowMount } from '@vue/test-utils'

import PrecisionModelStat from '@/components/Models/ModelStats/PrecisionModelStat.vue'

it('matches snapshot', () => {
  const wrapper = shallowMount(PrecisionModelStat)
  expect(wrapper).toMatchSnapshot()
})
