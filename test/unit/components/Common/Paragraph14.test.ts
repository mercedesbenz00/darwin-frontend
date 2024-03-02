import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Paragraph14 from '@/components/Common/Paragraph14.vue'

const localVue = createLocalVue()
let slots: Slots

beforeEach(() => {
  slots = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Paragraph14, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots.default = 'default-slot'
  const wrapper = shallowMount(Paragraph14, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
