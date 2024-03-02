import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import DatasetCreateStepItem from '@/components/DatasetCreate/DatasetCreateStepItem.vue'

const localVue = createLocalVue()

const stubs: Stubs = ['router-link']

let propsData: {
  index: number
  step: { name: string, to?: string }
}

it('matches the snapshot when step has to', () => {
  propsData = {
    index: 1,
    step: { name: 'Step 1', to: '/create/1/annotator' }
  }
  const wrapper = shallowMount(DatasetCreateStepItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it("matches the snapshot when step doesn't have to", () => {
  propsData = {
    index: 1,
    step: { name: 'Step 2' }
  }
  const wrapper = shallowMount(DatasetCreateStepItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
