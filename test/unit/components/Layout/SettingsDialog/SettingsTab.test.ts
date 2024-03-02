import { createLocalVue, shallowMount } from '@vue/test-utils'

import SettingsTab from '@/components/Layout/SettingsDialog/SettingsTab.vue'

const localVue = createLocalVue()

it('matches snapshot when provided a template slot', () => {
  const wrapper = shallowMount(SettingsTab, {
    localVue,
    slots: { default: '<div class="default"></div>' },
    propsData: { title: 'Bar' }
  })
  expect(wrapper).toMatchSnapshot()
})

it('emits click', () => {
  const wrapper = shallowMount(SettingsTab, {
    localVue,
    propsData: {
      iconUrl: 'foo', title: 'Bar'
    }
  })
  wrapper.trigger('click')
  expect(wrapper.emitted().click).toEqual([[]])
})
