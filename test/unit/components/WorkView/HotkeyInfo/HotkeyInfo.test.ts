import { createLocalVue, shallowMount } from '@vue/test-utils'

import HotkeyInfo from '@/components/WorkView/HotkeyInfo/HotkeyInfo.vue'

const localVue = createLocalVue()

it('renders with the hotkeylist', () => {
  const platformGetter = jest.spyOn(window.navigator, 'platform', 'get')
  platformGetter.mockReturnValue('Macintosh')

  const wrapper = shallowMount(HotkeyInfo, {
    localVue,
    propsData: {
      hotkeys: [
        {
          name: 'General',
          hotkeys: [
            { description: 'CMD combination', keys: ['CMD', 'C'] },
            {
              description: 'Multiple hotkeys',
              keys: [{ keys: ['+'] }, { keys: ['SHIFT', 'Scroll'] }],
              multi: true
            },
            { description: 'Single hotkey', keys: ['Backspace'] }
          ]
        }
      ]
    }
  })

  expect(wrapper).toMatchSnapshot()
})
