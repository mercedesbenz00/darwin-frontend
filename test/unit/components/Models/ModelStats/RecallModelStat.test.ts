import { shallowMount } from '@vue/test-utils'

import RecallModelStat from '@/components/Models/ModelStats/RecallModelStat.vue'

it('matches snapshot', () => {
  const wrapper = shallowMount(RecallModelStat)
  expect(wrapper).toMatchSnapshot()
})
