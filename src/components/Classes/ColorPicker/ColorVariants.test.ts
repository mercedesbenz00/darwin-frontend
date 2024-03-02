import { createLocalVue, shallowMount } from '@vue/test-utils'

import ColorVariants from '@/components/Classes/ColorPicker/ColorVariants.vue'

const localVue = createLocalVue()

let propsData: { color: string }

beforeEach(() => {
  propsData = {
    color: 'rgba(255, 0, 0, 1.0)'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ColorVariants, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emit event when color is selected', () => {
  const wrapper = shallowMount(ColorVariants, { localVue, propsData })
  wrapper.findAll('.color-variants__color').at(0).trigger('click')
  expect(wrapper.emitted().select).toEqual([[propsData.color]])
})
