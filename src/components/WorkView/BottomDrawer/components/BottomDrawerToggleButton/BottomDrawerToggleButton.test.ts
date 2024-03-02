import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import BottomDrawerToggleButton from './BottomDrawerToggleButton.vue'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

it('matches snapshot with default props', () => {
  const wrapper = shallowMount(BottomDrawerToggleButton, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('emits click when button clicked', async () => {
  const wrapper = shallowMount(BottomDrawerToggleButton, { localVue })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
