import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Collapsable from '@/components/Common/Collapsable/Collapsable.vue'

const localVue = createLocalVue()
let propsData: {
  collapsed?: boolean
}
let slots: Slots

beforeEach(() => {
  propsData = {}
  slots = {
    title: 'title-slot',
    default: 'content'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Collapsable, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when collapsed', () => {
  propsData.collapsed = true
  const wrapper = shallowMount(Collapsable, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits expanded', async () => {
  propsData.collapsed = true
  const wrapper = shallowMount(Collapsable, { localVue, propsData, slots })
  await wrapper.find('.collapsable__header').trigger('click')
  expect(wrapper.emitted().expanded).toBeDefined()
  expect(wrapper.emitted()['update:collapsed']).toEqual([[false]])
})

it('emits collapsed', async () => {
  const wrapper = shallowMount(Collapsable, { localVue, propsData, slots })
  await wrapper.find('.collapsable__header').trigger('click')
  expect(wrapper.emitted().collapsed).toBeDefined()
  expect(wrapper.emitted()['update:collapsed']).toEqual([[true]])
})
