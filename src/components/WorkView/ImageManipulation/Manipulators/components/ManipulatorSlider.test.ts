import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import { VueSlider } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import ManipulatorSlider from '@/components/WorkView/ImageManipulation/Manipulators/components/ManipulatorSlider.vue'

const localVue = createLocalVue()
const mocks = { $theme: createMockTheme() }
const stubs: Stubs = { 'vue-slider': VueSlider }

it('matches the snapshot', () => {
  const propsData = {
    value: [1, 100]
  }
  const wrapper = shallowMount(ManipulatorSlider, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input and change when value changes', async () => {
  const propsData = {
    value: [1, 100]
  }
  const wrapper = shallowMount(ManipulatorSlider, { localVue, mocks, propsData, stubs })
  await emitRootStub(wrapper, 'input', [4, 10])
  expect(wrapper.emitted().input).toEqual([[[4, 10]]])
  expect(wrapper.emitted().change).toEqual([[[4, 10]]])
})
