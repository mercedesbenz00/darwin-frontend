import { createLocalVue, shallowMount } from '@vue/test-utils'

import LayerBar from '@/components/WorkView/LayerBar/LayerBar.vue'
const localVue = createLocalVue()

let propsData: { editable?: boolean }
it('matches snapshot when empty', () => {
  const wrapper = shallowMount(LayerBar, { localVue })
  expect(wrapper).toMatchSnapshot()
})

const slots = {
  default: '<div class="default"></div>',
  empty: '<div class="empty"></div>',
  header: '<div class="header"></div>'
}

it('matches snapshot when empty with slots', () => {
  const wrapper = shallowMount(LayerBar, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with annotations', () => {
  const wrapper = shallowMount(LayerBar, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with annotations with slots', () => {
  const wrapper = shallowMount(LayerBar, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when editable', () => {
  propsData = { editable: true }
  const wrapper = shallowMount(LayerBar, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits move-up when shift + [', () => {
  propsData = { editable: true }
  const wrapper = shallowMount(LayerBar, { localVue, propsData, slots })
  document.dispatchEvent(new KeyboardEvent('keydown', { shiftKey: true, code: 'BracketRight' }))
  expect(wrapper.emitted()['move-up']).toHaveLength(1)
})

it('emits move-down when shift + ]', () => {
  propsData = { editable: true }
  const wrapper = shallowMount(LayerBar, { localVue, propsData, slots })
  document.dispatchEvent(new KeyboardEvent('keydown', { shiftKey: true, code: 'BracketLeft' }))
  expect(wrapper.emitted()['move-down']).toHaveLength(1)
})

it('emits move-top when ctrl + [', () => {
  propsData = { editable: true }
  const wrapper = shallowMount(LayerBar, { localVue, propsData, slots })
  document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: '[' }))
  expect(wrapper.emitted()['move-top']).toHaveLength(1)
})

it('emits move-bottom when ctrl + ]', () => {
  propsData = { editable: true }
  const wrapper = shallowMount(LayerBar, { localVue, propsData, slots })
  document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: ']' }))
  expect(wrapper.emitted()['move-bottom']).toHaveLength(1)
})
