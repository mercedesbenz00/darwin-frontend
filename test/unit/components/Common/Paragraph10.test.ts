import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Paragraph10 from '@/components/Common/Paragraph10.vue'

const localVue = createLocalVue()
let slots: Slots

beforeEach(() => {
  slots = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Paragraph10, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots.default = 'default-slot'
  const wrapper = shallowMount(Paragraph10, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
