import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import Description from '@/components/Classes/AnnotationClassDialog/components/Description.vue'

const localVue = createLocalVue()

let propsData: {
  description: string
}
const stubs: Stubs = { 'text-area': true }

it('matches snapshot', () => {
  propsData = {
    description: 'Test Description'
  }
  const wrapper = shallowMount(Description, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits update event', async () => {
  propsData = {
    description: 'Test Description'
  }
  const wrapper = shallowMount(Description, { localVue, propsData, stubs })
  wrapper.find('text-area-stub').vm.$emit('input', 'New Description')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['update:description']).toEqual([['New Description']])
})
