import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { HotkeyString } from '@/components/WorkView/HotkeyInfo/types'

import HotkeyInput from './HotkeyInput.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  hotkey: HotkeyString | null
}

beforeEach(() => {
  propsData = { hotkey: null }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with the hotkey', () => {
  propsData.hotkey = {
    keys: ['Tab', '1']
  }
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
