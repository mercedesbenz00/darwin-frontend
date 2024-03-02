import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import ActiveSectionIcon from './ActiveSectionIcon.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

/**
 * Should not render icon in case of one view
 */
it('matches snapshot with single view', () => {
  const editor = new Editor(new ItemManager(store), store)
  const wrapper = shallowMount(ActiveSectionIcon, {
    localVue,
    propsData: {
      view: editor.viewsList[0],
      active: false
    }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with multiple views view', () => {
  const editor = new Editor(new ItemManager(store), store)
  editor.setupLayout({
    type: 'horizontal',
    views: [{
      item: null,
      framesGroup: [0]
    }, {
      item: null,
      framesGroup: [1]
    }]
  })

  const wrapper = shallowMount(ActiveSectionIcon, {
    localVue,
    propsData: {
      view: editor.viewsList[0],
      active: false
    }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with active state', () => {
  const editor = new Editor(new ItemManager(store), store)
  editor.setupLayout({
    type: 'horizontal',
    views: [{
      item: null,
      framesGroup: [0]
    }, {
      item: null,
      framesGroup: [1]
    }]
  })

  const wrapper = shallowMount(ActiveSectionIcon, {
    localVue,
    propsData: {
      view: editor.viewsList[0],
      active: true
    }
  })
  expect(wrapper).toMatchSnapshot()
})
