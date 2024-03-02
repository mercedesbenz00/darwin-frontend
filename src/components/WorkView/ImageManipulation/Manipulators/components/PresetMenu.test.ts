import { createLocalVue, shallowMount } from '@vue/test-utils'

import { VPopover } from 'test/unit/stubs'

import PresetMenu from './PresetMenu.vue'

const localVue = createLocalVue()
const slots = {
  default: 'Default slot'
}

it('matches snapshot with full slots', () => {
  const wrapper = shallowMount(PresetMenu, { localVue, slots, stubs: { VPopover } })
  expect(wrapper).toMatchSnapshot()
})

it('should emit apply-changes', async () => {
  const wrapper = shallowMount(PresetMenu, { localVue, slots, stubs: { VPopover } })
  await wrapper.findAll('popup-menu-item-stub').at(0).trigger('mousedown')
  expect(wrapper.emitted()['apply-changes']).toBeDefined()
})

it('should emit edit', async () => {
  const wrapper = shallowMount(PresetMenu, { localVue, slots, stubs: { VPopover } })
  await wrapper.findAll('popup-menu-item-stub').at(1).trigger('mousedown')
  expect(wrapper.emitted().edit).toBeDefined()
})

it('should emit delete', async () => {
  const wrapper = shallowMount(PresetMenu, { localVue, slots, stubs: { VPopover } })
  await wrapper.findAll('popup-menu-item-stub').at(2).trigger('mousedown')
  expect(wrapper.emitted().delete).toBeDefined()
})
