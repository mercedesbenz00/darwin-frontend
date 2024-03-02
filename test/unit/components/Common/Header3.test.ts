import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Header3 from '@/components/Common/Header3.vue'

const localVue = createLocalVue()
let slots: Slots

beforeEach(() => {
  slots = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Header3, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots.default = 'default-slot'
  const wrapper = shallowMount(Header3, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
