import { createLocalVue, shallowMount } from '@vue/test-utils'

import HotkeyDisplay from '@/components/Common/HotkeyDisplay.vue'

const localVue = createLocalVue()

let propsData: {
  hotkey?: string | null
}

beforeEach(() => { propsData = {} })

it('matches snapshot when no hotkey', () => {
  const wrapper = shallowMount(HotkeyDisplay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when hotkey specified', () => {
  propsData.hotkey = '1'
  const wrapper = shallowMount(HotkeyDisplay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
