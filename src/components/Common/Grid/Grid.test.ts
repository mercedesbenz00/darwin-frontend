import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vue from 'vue'

import { createMockTheme } from 'test/unit/components/mocks'

import { Grid, GridProps, SizeStep } from '@/components/Common/Grid'
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

let propsData: GridProps

beforeEach(() => {
  propsData = {
    loading: false,
    initialItemId: null,
    emptyMessage: null,
    items: [],
    cardMarginLR: 8,
    cardMarginTB: 10,
    sizeStep: SizeStep.md,
    allowInfiniteScroll: false,
    totalCount: 0,
    skeletonCount: 0
  }
})

const mocks = { $theme: createMockTheme() }

const stubs = {
  DynamicScroller: ScrollerStub
}

it('matches snapshot', () => {
  propsData.items = [{ id: '1', data: {} }, { id: '2', data: {} }]
  const wrapper = shallowMount(Grid, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no data', () => {
  propsData.emptyMessage = 'No data'
  const wrapper = shallowMount(Grid, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with skeleton when loading status', () => {
  propsData.skeletonCount = 5
  propsData.loading = true
  const wrapper = shallowMount(Grid, { localVue, mocks, stubs, propsData })
  expect(wrapper).toMatchSnapshot()
})
