import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import enterDirective from '@/directives/enter'
import escDirective from '@/directives/esc'
import loadingDirective from '@/directives/loading'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import Layout from './Layout.vue'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)
localVue.use(VModal)
localVue.use(VueLazyload)
localVue.directive('enter', enterDirective)
localVue.directive('esc', escDirective)
localVue.directive('loading', loadingDirective)

let mocks: {
  $can: () => boolean
  $featureEnabled: () => boolean
  $theme: ReturnType<typeof createMockTheme>
}

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor
}

beforeEach(() => {
  store = createTestStore()

  propsData = {
    editor: new Editor(new ItemManager(store), store)
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with horizontal layout', () => {
  propsData.editor.setupLayout({
    type: 'horizontal',
    views: [{
      item: null,
      framesGroup: [0]
    }, {
      item: null,
      framesGroup: [1]
    }]
  })

  const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with vertical layout', () => {
  propsData.editor.setupLayout({
    type: 'vertical',
    views: [{
      item: null,
      framesGroup: [0]
    }, {
      item: null,
      framesGroup: [1]
    }]
  })

  const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with grid layout', () => {
  propsData.editor.setupLayout({
    type: 'grid',
    views: [{
      item: null,
      framesGroup: [1]
    }, {
      item: null,
      framesGroup: [2]
    }, {
      item: null,
      framesGroup: [3]
    }, {
      item: null,
      framesGroup: [4]
    }]
  })

  const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('renders comment UI', () => {
  const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
  expect(wrapper.find('comment-icons-stub').exists()).toBe(true)
})

describe('grid', () => {
  it('should set 2x2 grid for 4', () => {
    propsData.editor.setupLayout({
      type: 'grid',
      views: [{
        item: null,
        framesGroup: [1]
      }, {
        item: null,
        framesGroup: [2]
      }, {
        item: null,
        framesGroup: [3]
      }, {
        item: null,
        framesGroup: [4]
      }]
    })

    const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
    expect(wrapper.classes()).toEqual(['layout', 'layout--grid', 'layout--grid--2'])
  })

  it('should set 2x2 grid for less than 4 groups amount', () => {
    propsData.editor.setupLayout({
      type: 'grid',
      views: [{
        item: null,
        framesGroup: [1]
      }, {
        item: null,
        framesGroup: [2]
      }, {
        item: null,
        framesGroup: [3]
      }]
    })

    const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
    expect(wrapper.classes()).toEqual(['layout', 'layout--grid', 'layout--grid--2'])
  })

  it('should set 3xN for groups amount more than 4 and less or equal 9', () => {
    propsData.editor.setupLayout({
      type: 'grid',
      views: [{
        item: null,
        framesGroup: [1]
      }, {
        item: null,
        framesGroup: [2]
      }, {
        item: null,
        framesGroup: [3]
      }, {
        item: null,
        framesGroup: [4]
      }, {
        item: null,
        framesGroup: [5]
      }, {
        item: null,
        framesGroup: [6]
      }, {
        item: null,
        framesGroup: [7]
      }, {
        item: null,
        framesGroup: [8]
      }]
    })

    const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
    expect(wrapper.classes()).toEqual(['layout', 'layout--grid', 'layout--grid--3'])
  })

  it('should set 4xN grid for groups more than 9', () => {
    propsData.editor.setupLayout({
      type: 'grid',
      views: [{
        item: null,
        framesGroup: [1]
      }, {
        item: null,
        framesGroup: [2]
      }, {
        item: null,
        framesGroup: [3]
      }, {
        item: null,
        framesGroup: [4]
      }, {
        item: null,
        framesGroup: [5]
      }, {
        item: null,
        framesGroup: [6]
      }, {
        item: null,
        framesGroup: [7]
      }, {
        item: null,
        framesGroup: [8]
      }, {
        item: null,
        framesGroup: [9]
      }, {
        item: null,
        framesGroup: [10]
      }]
    })

    const wrapper = shallowMount(Layout, { localVue, store, propsData, mocks })
    expect(wrapper.classes()).toEqual(['layout', 'layout--grid', 'layout--grid--4'])
  })
})
