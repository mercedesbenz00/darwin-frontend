import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'

import { createMockTheme } from 'test/unit/components/mocks'

import Gallery from '@/components/Common/Gallery/Gallery.vue'
import { VIEW_MODE, GalleryProps } from '@/components/Common/Gallery/types'
import escDirective from '@/directives/esc'
import loadingDirective from '@/directives/loading'

const localVue = createLocalVue()
localVue.directive('loading', loadingDirective)
localVue.directive('esc', escDirective)

const ScrollerStub = Vue.component('ScrollerStub', {
  props: { items: { type: Array, default: () => [] } },
  methods: {
    scrollToItem: jest.fn()
  },
  template: `
    <div class="scroller-stub">
      <div ref="wrapper" v-for="item of items" :key="item.id">
        <slot :item="item" :active="true" />
      </div>
    </div>
  `
})

let propsData: GalleryProps

beforeEach(() => {
  propsData = {
    loaded: true,
    loading: false,
    loadingMessage: 'fetching data',
    items: []
  }
})

const mocks = { $theme: createMockTheme() }

const stubs = {
  RecycleScroller: ScrollerStub
}

it('matches snapshot in card mode', () => {
  propsData.items = [{ id: '1', data: {} }, { id: '2', data: {} }]
  propsData.viewMode = VIEW_MODE.CARD
  const wrapper = shallowMount(Gallery, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in list mode', () => {
  propsData.items = [{ id: '1', data: {} }, { id: '2', data: {} }]
  propsData.viewMode = VIEW_MODE.LIST
  const wrapper = shallowMount(Gallery, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no data', () => {
  propsData.emptyMessage = 'No data'
  const wrapper = shallowMount(Gallery, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits select-all when you press esc', async () => {
  propsData.items = [{ id: '1', data: {} }, { id: '2', data: {} }]

  const wrapper = mount(Gallery, {
    localVue,
    mocks,
    stubs: {
      ...stubs,
      'check-box': true,
      slider: true
    },
    propsData
  })

  await flushPromises()
  const component = wrapper.vm as any
  component.$refs.recycleScroller = { $refs: { wrapper: { clientWidth: 100 } } }

  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['select-all']).toEqual([[false]])
})

it('navigate to the initial item when initialItemId is provided as a prop', async () => {
  propsData.items = [{ id: '1', data: {} }, { id: '2', data: {} }]
  const wrapper = shallowMount(Gallery, { localVue, mocks, stubs, propsData })
  const component = wrapper.vm as any
  component.$refs.recycleScroller = {
    scrollToItem: jest.fn(),
    $refs: { wrapper: { clientWidth: 100 } }
  }
  wrapper.setProps({ initialItemId: '2' })
  await component.$nextTick()
  expect(component.$refs.recycleScroller.scrollToItem).toHaveBeenCalledWith(1)
})
