import { createLocalVue, shallowMount } from '@vue/test-utils'

import HotkeyDisplay from '@/components/WorkView/HotkeyInfo/HotkeyDisplay.vue'

const localVue = createLocalVue()

it('renders with the right keys for MacOS', () => {
  const platformGetter = jest.spyOn(window.navigator, 'platform', 'get')
  platformGetter.mockReturnValue('Macintosh')

  const wrapper = shallowMount(HotkeyDisplay, {
    localVue,
    propsData: { keys: ['CMD', 'C'] }
  })

  expect(wrapper).toMatchSnapshot('MacOS version')
})

it('renders with the right keys for Windows', () => {
  const platformGetter = jest.spyOn(window.navigator, 'platform', 'get')
  platformGetter.mockReturnValue('Win32')

  const wrapper = shallowMount(HotkeyDisplay, {
    localVue,
    propsData: { keys: ['CMD', 'C'] }
  })

  expect(wrapper).toMatchSnapshot('Windows version')
})
