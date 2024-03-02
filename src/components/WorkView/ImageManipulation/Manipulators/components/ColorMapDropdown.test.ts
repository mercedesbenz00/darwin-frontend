import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import ColorMapDropdown from '@/components/WorkView/ImageManipulation/Manipulators/components/ColorMapDropdown.vue'

const localVue = createLocalVue()

let propsData: {
  value: string
}

const stubs: Stubs = { Select2: true }

it('matches snapshot', () => {
  propsData = { value: 'default' }
  const wrapper = shallowMount(ColorMapDropdown, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input/change event when you select an option', async () => {
  propsData = { value: 'default' }
  const wrapper = shallowMount(ColorMapDropdown, { localVue, propsData, stubs })
  await wrapper.find('select2-stub').vm.$emit('select', { id: 'bone' })
  expect(wrapper.emitted().input).toEqual([['bone']])
  expect(wrapper.emitted().change).toEqual([['bone']])
})
