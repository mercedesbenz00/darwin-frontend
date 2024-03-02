import { createLocalVue, shallowMount } from '@vue/test-utils'

import RoundedTriToggleButton from '@/components/Common/Button/V1/RoundedTriToggleButton/RoundedTriToggleButton.vue'
import { TriToggleStatus } from '@/utils'

const localVue = createLocalVue()

let propsData: {
  status: TriToggleStatus
}
const slots = {
  default: 'A message'
}

beforeEach(() => {
  propsData = { status: 'none' }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(RoundedTriToggleButton, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when positive', () => {
  propsData.status = 'positive'
  const wrapper = shallowMount(RoundedTriToggleButton, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when negative', () => {
  propsData.status = 'negative'
  const wrapper = shallowMount(RoundedTriToggleButton, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slot', () => {
  const wrapper = shallowMount(RoundedTriToggleButton, { localVue, propsData, slots })
  expect(wrapper.text()).toContain(slots.default)
})

it('emits toggle', async () => {
  const wrapper = shallowMount(RoundedTriToggleButton, { localVue, propsData, slots })
  await wrapper.find('button').trigger('mousedown')
  expect(wrapper.emitted().toggle!.length).toEqual(1)
  expect(wrapper.emitted()['update:status']![0]).toEqual(['positive'])

  await wrapper.setProps({ status: 'positive' })
  await wrapper.find('button').trigger('mousedown')
  expect(wrapper.emitted()['update:status']![1]).toEqual(['negative'])

  await wrapper.setProps({ status: 'negative' })
  await wrapper.find('button').trigger('mousedown')
  expect(wrapper.emitted()['update:status']![2]).toEqual(['none'])
})
