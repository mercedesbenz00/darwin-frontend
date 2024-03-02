import { createLocalVue, shallowMount } from '@vue/test-utils'

import PresetOption from './PresetOption.vue'
import { PresetOptionType } from './types'

const localVue = createLocalVue()
let propsData: {
  option: PresetOptionType
  isSelected?: boolean
}

beforeEach(() => {
  propsData = {
    option: {
      id: 1,
      label: 'Preset 1',
      hotKey: null
    },
    isSelected: false
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PresetOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.isSelected = true
  const wrapper = shallowMount(PresetOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should emit apply-changes', async () => {
  const wrapper = shallowMount(PresetOption, { localVue, propsData })
  await wrapper.find('preset-menu-stub').vm.$emit('apply-changes')
  expect(wrapper.emitted()['apply-changes']).toBeDefined()
})

it('should emit edit', async () => {
  const wrapper = shallowMount(PresetOption, { localVue, propsData })
  await wrapper.find('preset-menu-stub').vm.$emit('edit')
  expect(wrapper.emitted().edit).toBeDefined()
})

it('should emit delete', async () => {
  const wrapper = shallowMount(PresetOption, { localVue, propsData })
  await wrapper.find('preset-menu-stub').vm.$emit('delete')
  expect(wrapper.emitted().delete).toBeDefined()
})
