import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalHeaderV2, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    title: 'Title',
    close: 'Close'
  }
  const wrapper = shallowMount(ModalHeaderV2, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
