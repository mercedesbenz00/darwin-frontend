import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ModalHeader from '@/components/Common/Modal/V1/ModalHeader.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalHeader, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    title: 'Title',
    close: 'Close'
  }
  const wrapper = shallowMount(ModalHeader, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
