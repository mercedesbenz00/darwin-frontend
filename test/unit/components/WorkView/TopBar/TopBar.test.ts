import { createLocalVue, shallowMount } from '@vue/test-utils'

import TopBar from '@/components/WorkView/TopBar/TopBar.vue'

const localVue = createLocalVue()

it('matches snapshot with slots', () => {
  const slots = {
    left: 'Left slot content',
    center: 'Center slot content',
    right: 'Right slot content'
  }

  const wrapper = shallowMount(TopBar, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
