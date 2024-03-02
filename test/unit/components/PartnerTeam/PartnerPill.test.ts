import { createLocalVue, shallowMount } from '@vue/test-utils'

import PartnerPill from '@/components/PartnerTeam/PartnerPill.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(PartnerPill, { localVue })
  expect(wrapper).toMatchSnapshot()
})
