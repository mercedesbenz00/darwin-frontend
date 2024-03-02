import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalContentV2, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    default: 'Default slot'
  }
  const wrapper = shallowMount(ModalContentV2, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
