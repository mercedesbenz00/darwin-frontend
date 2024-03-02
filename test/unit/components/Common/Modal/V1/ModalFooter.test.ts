import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ModalFooter from '@/components/Common/Modal/V1/ModalFooter.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalFooter, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    default: 'Default slot'
  }
  const wrapper = shallowMount(ModalFooter, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
