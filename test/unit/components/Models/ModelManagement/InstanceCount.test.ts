import { createLocalVue, shallowMount } from '@vue/test-utils'

import InstanceCount from '@/components/Models/ModelManagement/InstanceCount.vue'

const localVue = createLocalVue()

let propsData: {
  autoStart: boolean
  autoStop: boolean
  minimum: number
  maximum: number
}

beforeEach(() => {
  propsData = {
    autoStart: false,
    autoStop: false,
    minimum: 5,
    maximum: 10
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(InstanceCount, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const model = {
  minimumInput: 'numeric-input-stub:first-child',
  maximumInput: 'numeric-input-stub:last-child'
}

it('emits minimum change', async () => {
  const wrapper = shallowMount(InstanceCount, { localVue, propsData })
  await wrapper.find(model.minimumInput).vm.$emit('change', 7)
  expect(wrapper.emitted()['update:minimum']![0]).toEqual([7])
})

it('if minimum goes past maximum, also emits maximum', async () => {
  const wrapper = shallowMount(InstanceCount, { localVue, propsData })
  await wrapper.find(model.minimumInput).vm.$emit('change', 11)
  expect(wrapper.emitted()['update:minimum']![0]).toEqual([11])
  expect(wrapper.emitted()['update:maximum']![0]).toEqual([11])
})

it('emits maximum change', async () => {
  const wrapper = shallowMount(InstanceCount, { localVue, propsData })
  await wrapper.find(model.maximumInput).vm.$emit('change', 7)
  expect(wrapper.emitted()['update:maximum']![0]).toEqual([7])
})
