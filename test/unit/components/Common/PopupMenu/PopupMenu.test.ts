import { createLocalVue, shallowMount } from '@vue/test-utils'

import PopupMenu from '@/components/Common/PopupMenu/V1/PopupMenu.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const slots = {
    default: {
      template: '<div>default</div>'
    }
  }
  const wrapper = shallowMount(PopupMenu, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
