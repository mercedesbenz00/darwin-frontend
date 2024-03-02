import { createLocalVue, shallowMount } from '@vue/test-utils'

import ClientInviteInfo from '@/components/PartnerTeam/ClientInviteInfo.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(ClientInviteInfo, { localVue })
  expect(wrapper).toMatchSnapshot()
})
