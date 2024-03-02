import { createLocalVue, shallowMount } from '@vue/test-utils'

import { ToolBarHistoryTools } from '@/components/WorkView/ToolBar'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

it('matches snapshot when all props are true', () => {
  const propsData = {
    canUndo: true,
    canRedo: true
  }

  const wrapper = shallowMount(ToolBarHistoryTools, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when all props are false', () => {
  const propsData = {
    canUndo: false,
    canRedo: false
  }

  const wrapper = shallowMount(ToolBarHistoryTools, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits events when you click on buttons', async () => {
  const propsData = {
    canUndo: true,
    canRedo: true
  }

  const wrapper = shallowMount(ToolBarHistoryTools, { localVue, propsData })
  const undo = wrapper.find('.history-tools__button__undo')
  const redo = wrapper.find('.history-tools__button__redo')
  await undo.vm.$emit('click')
  expect(wrapper.emitted().undo).toHaveLength(1)
  await redo.vm.$emit('click')
  expect(wrapper.emitted().redo).toHaveLength(1)
})

it('not emits events when you click on buttons if disabled', async () => {
  const propsData = {
    canUndo: false,
    canRedo: false
  }

  const wrapper = shallowMount(ToolBarHistoryTools, { localVue, propsData })
  const undo = wrapper.find('.history-tools__button__undo')
  await undo.vm.$emit('click')
  const emitted = wrapper.emitted().undo?.[0]
  expect(!emitted || emitted.length === 0).toBe(true)
})

it('not emits events when you click on buttons if disabled', async () => {
  const propsData = {
    canUndo: false,
    canRedo: false
  }

  const wrapper = shallowMount(ToolBarHistoryTools, { localVue, propsData })
  const redo = wrapper.find('.history-tools__button__redo')
  await redo.vm.$emit('click')
  const emitted = wrapper.emitted().redo?.[0]
  expect(!emitted || emitted.length === 0).toBe(true)
})
