import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'

import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
let slots: Slots = {}

let propsData: {
  name?: string
  size: string
}

const mocks = { $theme: createMockTheme() }

beforeEach(() => {
  slots = {}
  propsData = { name: 'test-dialog', size: 'small' }
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(ModalV2, { localVue, slots, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    default: 'Default slot'
  }
  const wrapper = shallowMount(ModalV2, { localVue, slots, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})
