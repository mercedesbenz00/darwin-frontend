import { shallowMount } from '@vue/test-utils'

import IoUModelStat from '@/components/Models/ModelStats/IoUModelStat.vue'

it('matches snapshot', () => {
  const wrapper = shallowMount(IoUModelStat)
  expect(wrapper).toMatchSnapshot()
})
