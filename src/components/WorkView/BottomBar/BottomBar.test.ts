import { createLocalVue, shallowMount, Wrapper, Stubs } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetItemPayload } from 'test/unit/factories'

import { BottomBar, BottomBarItem } from '@/components/WorkView/BottomBar'

const localVue = createLocalVue()
localVue.directive('lazy', () => {})
localVue.directive('tooltip', () => {})
localVue.use(Vuex)

const RecycleScroller = Vue.component('RecycleScroller', {
  props: { items: { type: Array, default: () => [] } },
  methods: {
    scrollToItem: () => {}
  },
  template: `
    <div>
      <div v-for="(item, index) of items" :key="index">
        <slot :item="item" :index="index" />
      </div>
    </div>
  `
})

const sfh = buildDatasetDetailPayload({ id: 1 })

let scrollTo: jest.SpyInstance
let store: ReturnType<typeof createTestStore>
let stubs: Stubs
let mocks: {
  $theme: ReturnType<typeof createMockTheme>,
  $route: { query: { dataset?: string, task?: string, image?: string }}
}
let propsData: { items: BottomBarItem[], selectedItem?: BottomBarItem }

// 1000 images
const items: BottomBarItem[] =
  Array.from(Array(1000), (x, i) => i).map(index => ({
    data: buildDatasetItemPayload({ id: index, seq: index, dataset_id: sfh.id }),
    id: `${index}`,
    size: 76
  }))

beforeEach(() => {
  Element.prototype.scrollTo = jest.fn()
  scrollTo = jest.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => {})
  mocks = {
    $theme: createMockTheme(),
    $route: { query: { } }
  }
  store = createTestStore()
  stubs = ['recycle-scroller']
  propsData = { items }
})

afterEach(() => {
  scrollTo.mockReset()
  // Actual element will have a scroll to. In jest/jsDOM, it does not
  // We have to cast to any to be able to delete it
  delete (Element.prototype as any).scrollTo
})

it('matches snapshot with available items', () => {
  stubs = { RecycleScroller }
  propsData.items = items.slice(0, 2)
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with available items, slot given', () => {
  stubs = { RecycleScroller }
  propsData.items = items.slice(0, 2)
  const slots = { item: '<div class="image" />' }

  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, slots, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when everything is loaded', () => {
  stubs = { RecycleScroller }
  propsData.items = items.slice(0, 10)
  propsData.selectedItem = items[0]
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('triggers select-item when an item is selected', async () => {
  stubs = { RecycleScroller }

  propsData.items = items.slice(0, 2)
  propsData.selectedItem = items[0]
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

  wrapper.findAll('.bottom-bar__content__list__item').at(1).trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['select-item']).toEqual([[items[1]]])
})

it('does not trigger "select-image" if there was a drag in progress', async () => {
  stubs = { RecycleScroller }

  propsData.items = items.slice(0, 2)
  propsData.selectedItem = items[0]
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })
  wrapper.setData({ isDragging: true })

  wrapper.findAll('.bottom-bar__content__list__item').at(1).trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['select-image']).toBeUndefined()
})

describe('scroll events', () => {
  // On scroll, indices are taken from recycle scroller internals
  // Since we don't have access to those, the test has to mock them.
  const mockIndices = (wrapper: Wrapper<Vue>, indices: { from: number, to: number } | null) =>
    jest.spyOn(wrapper.vm as any, 'getActiveIndices').mockReturnValue(indices)

  it('emits event on scroll', async () => {
    const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

    mockIndices(wrapper, { from: 450, to: 470 })

    wrapper.find('recycle-scroller-stub').trigger('scroll.native.passive')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted()['page-changed']).toHaveLength(1)
    expect(wrapper.emitted()['page-changed']).toEqual([[450, 470]])
  })

  it('does not emit on scroll if autoscrolling, unsets autoScrolling', async () => {
    propsData.items = items.slice(0, 2)
    const data = () => ({ autoScrolling: true })
    const wrapper = shallowMount(BottomBar, { data, localVue, mocks, propsData, store, stubs })

    wrapper.find('recycle-scroller-stub').trigger('scroll.native.passive')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted()['page-changed']).toBeUndefined()

    expect(wrapper.vm.$data.autoScrolling).toBe(false)
  })
})

describe('adding items', () => {
  it('scrolls back when items are added to the start', async () => {
    const initialItems = items.slice(5, 10)
    propsData.items = initialItems
    propsData.selectedItem = items[5]
    const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

    const newItems = items.slice(3, 10)
    wrapper.setProps({ items: newItems })
    await wrapper.vm.$nextTick()
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', left: 152 })
  })

  it('does not scroll back when images are added to the end', async () => {
    const initialItems = items.slice(5, 10)
    propsData.items = initialItems
    propsData.selectedItem = items[5]
    const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

    wrapper.setProps({ items: items.slice(5, 12) })
    await wrapper.vm.$nextTick()
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', left: 0 })
  })
})

it('scrolls to selected item on change', async () => {
  const initialItems = items.slice(5, 10)
  propsData.items = initialItems
  propsData.selectedItem = initialItems[0]
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

  wrapper.setProps({ selectedItem: initialItems[1] })
  await wrapper.vm.$nextTick()
  expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', left: 76 })
})

it('sets dragging on drag move with more than 0 movement', async () => {
  jest.useFakeTimers()
  propsData.items = items.slice(5, 10)
  propsData.selectedItem = items[5]
  const wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })

  // dragscroll in place (effectively user just clicking on something)
  wrapper.find('recycle-scroller-stub').vm.$emit('dragscrollmove', { deltaX: 0 })
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.isDragging).toBe(false)

  // dragscroll in one direction
  wrapper.find('recycle-scroller-stub').vm.$emit('dragscrollmove', { deltaX: 1 })
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.isDragging).toBe(true)

  // check dragscrollend schedules to unset flag on timeout
  wrapper.find('recycle-scroller-stub').vm.$emit('dragscrollend')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.isDragging).toBe(true)
  jest.advanceTimersByTime(300)
  expect(wrapper.vm.$data.isDragging).toBe(false)

  // dragscroll in the opposite direction
  wrapper.find('recycle-scroller-stub').vm.$emit('dragscrollmove', { deltaX: -1 })
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.isDragging).toBe(true)

  // check dragscrollend schedules to unset flag on timeout
  wrapper.find('recycle-scroller-stub').vm.$emit('dragscrollend')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.isDragging).toBe(true)
  jest.advanceTimersByTime(300)
  expect(wrapper.vm.$data.isDragging).toBe(false)
})

describe('when regular', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })
    store.commit('workview/SET_TUTORIAL_MODE', false)
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('renders workflow filter', () => {
    expect(wrapper.find('workflow-filter-stub').exists()).toBe(true)
  })
})

describe('when tutorial', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(BottomBar, { localVue, mocks, propsData, store, stubs })
    store.commit('workview/SET_TUTORIAL_MODE', true)
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render workflow filter', () => {
    expect(wrapper.find('workflow-filter-stub').exists()).toBe(false)
  })
})
