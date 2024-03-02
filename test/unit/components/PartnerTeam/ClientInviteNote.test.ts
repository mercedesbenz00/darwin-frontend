import { createLocalVue, shallowMount } from '@vue/test-utils'

import ClientInviteNote from '@/components/PartnerTeam/ClientInviteNote.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(ClientInviteNote, { localVue })
  expect(wrapper).toMatchSnapshot()
})
