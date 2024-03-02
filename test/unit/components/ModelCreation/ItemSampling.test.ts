import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetItemPayload, buildDatasetPayload } from 'test/unit/factories'

import ItemSampling from '@/components/ModelCreation/ItemSampling.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const mocks = {
  $theme: createMockTheme()
}

beforeEach(() => {
  store = createTestStore()
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload({ id: 9 }))
})

let wrapper: Wrapper<Vue>

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

const stubs = { RecycleScroller: RecycleScrollerStub }

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
}

const model = {
  navPrev: '.sampling__navigation.sampling__navigation--prev',
  navNext: '.sampling__navigation.sampling__navigation--next'
}

describe('on initial load', () => {
  beforeEach(async () => {
    wrapper = shallowMount(ItemSampling, { localVue, mocks, store, stubs })
    await wrapper.setData({ loading: true })
  })

  itMatchesSnapshot()
})

describe('when loaded', () => {
  beforeEach(async () => {
    wrapper = shallowMount(ItemSampling, { localVue, mocks, store, stubs })
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [
      buildDatasetItemPayload({ id: 1 }),
      buildDatasetItemPayload({ id: 2 })
    ])
    await wrapper.setData({ loading: false })
  })

  itMatchesSnapshot()
})

describe('when no items', () => {
  beforeEach(async () => {
    wrapper = shallowMount(ItemSampling, { localVue, mocks, store, stubs })
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [])
    await wrapper.setData({ loading: false })
  })

  itMatchesSnapshot()

  it('renders placeholder', () => {
    expect(wrapper.text()).toContain('no completed items')
  })
})

describe('on last page', () => {
  let mockScroller: {
    getScroll: jest.Mock,
    scrollToItem: jest.Mock
  }

  beforeEach(async () => {
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [
      buildDatasetItemPayload({ id: 1 }),
      buildDatasetItemPayload({ id: 2 })
    ])

    wrapper = shallowMount(ItemSampling, { localVue, mocks, store })

    mockScroller = {
      getScroll: jest.fn(),
      scrollToItem: jest.fn()
    }

    mockScroller.getScroll.mockReturnValue({ start: 150, end: 300 })

    wrapper.vm.$refs.recycleScroller = mockScroller as any
    await wrapper.setData({ loading: false })
    await wrapper.find('recycle-scroller-stub').vm.$emit('update')
    await wrapper.vm.$nextTick()
  })

  itMatchesSnapshot()

  it('renders tooltip', () => {
    expect(wrapper.find(model.navNext).attributes('tooltip')).not.toBe('undefined')
  })

  it('loads more items on next', async () => {
    (store.dispatch as jest.Mock).mockReset()

    expect(store.dispatch).not.toHaveBeenCalledWith('neuralModel/loadSampleDatasetItems')
    await wrapper.find(model.navNext).trigger('click')
    expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadSampleDatasetItems')
  })
})
