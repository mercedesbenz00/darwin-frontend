import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import { createMockTheme } from 'test/unit/components/mocks'

import ImageThumbnailSlider from '@/components/Common/ImageThumbnailSlider.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const RecycleScrollerStub = localVue.component('RecycleScroller', {
  props: { items: { type: Array, default: () => [] } },
  template: `
    <div class="vue-recycle-scroller">
      <div class="vue-recycle-scroller__item-wrapper">
        <div v-for="(item, index) of items" :key="index" class="vue-recycle-scroller__item-view">
          <slot :item="item" :index="index" />
        </div>
      </div>
    </div>
  `
})

const scopedSlots = {
  item: `
    <div class="item-stub" slot-scope="ctx">
      <div>Index: {{ctx.index}}</div>
      <div>Item ID: {{ctx.item.id}}</div>
    </div>
  `
}

const items = [
  { id: 1 },
  { id: 2 },
  { id: 3 }
]

const stubs = { RecycleScroller: RecycleScrollerStub }
const mocks = { $theme: createMockTheme() }
let propsData: {
  items: {id: number}[]
  itemSize: number
  selectedItem: {id: number} | null
  disableNavOnEdge?: boolean
}

const model = {
  items: '.item-stub',
  navigationPrev: '.thumb_slide__navigation--prev',
  navigationNext: '.thumb_slide__navigation--next'
}

beforeEach(() => {
  propsData = {
    items,
    itemSize: 50,
    selectedItem: null
  }
})

it('matches snapshot', () => {
  propsData.selectedItem = items[0]

  const wrapper = shallowMount(ImageThumbnailSlider, {
    localVue, propsData, mocks, scopedSlots, stubs
  })

  expect(wrapper).toMatchSnapshot()
})

describe('when on left edge', () => {
  beforeEach(() => {
    propsData.selectedItem = items[0]
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits "next" events', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    wrapper.find(model.navigationNext).trigger('click')
    expect(wrapper.emitted().next!.length).toEqual(1)
  })

  it('disables "prev" button', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper.find(model.navigationPrev).attributes('disabled')).toBe('disabled')
    expect(wrapper.find(model.navigationNext).attributes('disabled')).not.toBe('disabled')
  })

  it('can leave "prev" button enabled', () => {
    propsData.disableNavOnEdge = false
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper.find(model.navigationPrev).attributes('disabled')).not.toBe('disabled')
    expect(wrapper.find(model.navigationNext).attributes('disabled')).not.toBe('disabled')
  })
})

describe('when on right edge', () => {
  beforeEach(() => {
    propsData.selectedItem = items[2]
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits "prev" events', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    wrapper.find(model.navigationPrev).trigger('click')
    expect(wrapper.emitted().prev!.length).toEqual(1)
    wrapper.find(model.navigationPrev).trigger('click')
    expect(wrapper.emitted().prev!.length).toEqual(2)
  })

  it('disables "next" button', () => {
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper.find(model.navigationPrev).attributes('disabled')).not.toBe('disabled')
    expect(wrapper.find(model.navigationNext).attributes('disabled')).toBe('disabled')
  })

  it('can leave "next" button enabled', () => {
    propsData.disableNavOnEdge = false
    const wrapper = shallowMount(ImageThumbnailSlider, { localVue, propsData, mocks, stubs })
    expect(wrapper.find(model.navigationPrev).attributes('disabled')).not.toBe('disabled')
    expect(wrapper.find(model.navigationNext).attributes('disabled')).not.toBe('disabled')
  })
})
