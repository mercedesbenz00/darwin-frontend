import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ModalContainer from '@/components/Common/Modal/V1/ModalContainer.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalContainer, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    default: 'Default slot'
  }
  const wrapper = shallowMount(ModalContainer, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
