import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { ResizeObserver } from 'vue-resize'
import Draggable from 'vuedraggable'

import { VirtualDraggableList } from '@/components/Common/VirtualDraggableList'

const localVue = createLocalVue()

const stubs = {
  Draggable,
  ResizeObserver
}

let propsData: {
  items: any[],
  preRenderItems?: number
}

beforeEach(() => {
  const items = Array.from(Array(1000).keys())
    .map((_, i) => ({ id: i, text: `Value ${i + 1}` }))

  propsData = {
    items
  }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(VirtualDraggableList, { localVue, propsData, stubs })

  await flushPromises()

  expect(wrapper).toMatchSnapshot()
})

it('should render items inside viewport only', async () => {
  propsData.preRenderItems = 1

  const wrapper = shallowMount(VirtualDraggableList, { localVue, propsData, stubs })

  await flushPromises()

  const items = wrapper.findAll('.wrapper [data-id]')

  expect(items.length).toBe(3)
})

it('should update items inside viewport on scroll', async () => {
  propsData.preRenderItems = 1

  const wrapper = shallowMount(VirtualDraggableList, { localVue, propsData, stubs })
  await flushPromises()
  const wrapperEl = wrapper.find('.wrapper')
  // with default item height 30px it should starts from 4th element
  wrapperEl.element.scrollTop = 120
  await wrapperEl.trigger('scroll')
  await flushPromises()

  const items = wrapper.findAll('.wrapper [data-id]')

  expect(items.at(0).attributes('data-id')).toBe('3')
  expect(items.at(1).attributes('data-id')).toBe('4')
})

it('should pre-render items outside of the viewport', async () => {
  propsData.preRenderItems = 2

  const wrapper = shallowMount(VirtualDraggableList, { localVue, propsData, stubs })
  await flushPromises()

  const wrapperEl = wrapper.find('.wrapper')
  wrapperEl.element.scrollTop = 120
  await wrapperEl.trigger('scroll')

  const items = wrapper.findAll('.wrapper [data-id]')

  expect(items.length).toBe(6)
})
