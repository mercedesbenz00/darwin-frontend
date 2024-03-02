import { createLocalVue, shallowMount } from '@vue/test-utils'

import DeploymentCost from '@/components/Models/ModelManagement/DeploymentCost.vue'
import { ModelDevice } from '@/store/modules/neuralModel/types'

const localVue = createLocalVue()

let propsData: {
  instanceCount: number,
  device?: ModelDevice
}

beforeEach(() => {
  propsData = {
    instanceCount: 5
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DeploymentCost, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders cost based on count and device', async () => {
  const wrapper = shallowMount(DeploymentCost, { localVue, propsData })
  expect(wrapper.text()).toContain('0.17 credit')

  await wrapper.setProps({ instanceCount: 7 })
  expect(wrapper.text()).toContain('0.23 credit')

  await wrapper.setProps({ device: ModelDevice.CPU })
  expect(wrapper.text()).toContain('0.23 credit')
})
