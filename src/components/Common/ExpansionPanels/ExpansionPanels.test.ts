import { createLocalVue, shallowMount } from '@vue/test-utils'

import ExpansionPanel from './ExpansionPanel.vue'
import ExpansionPanels from './ExpansionPanels.vue'

const localVue = createLocalVue()
localVue.component('ExpansionPanel', ExpansionPanel)

it('matches snapshot', () => {
  const wrapper = shallowMount(ExpansionPanels, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with item', () => {
  const wrapper = shallowMount(ExpansionPanels, {
    localVue,
    slots: {
      default: `
        <expansion-panel id="1">1</expansion-panel>
        <expansion-panel id="2">2</expansion-panel>
      `
    }
  })
  expect(wrapper).toMatchSnapshot()
})
