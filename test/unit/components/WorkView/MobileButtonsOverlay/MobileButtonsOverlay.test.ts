import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildToolConfigEntry } from 'test/unit/factories'

import MobileButtonsOverlay from '@/components/WorkView/MobileButtonsOverlay/MobileButtonsOverlay.vue'
import { Editor } from '@/engine/editor'
import { Tool, ItemManager } from '@/engine/managers'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let editor: Editor
let propsData: { editor: Editor }
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
})

it('renders nothing when renderMobileButtons is false', () => {
  const wrapper = shallowMount(MobileButtonsOverlay, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('renders nothing when currentTool is null', () => {
  store.commit('workview/SHOW_MOBILE_BUTTONS')
  const wrapper = shallowMount(MobileButtonsOverlay, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('renders nothing when isDrawing is undefined for tool', () => {
  const myTool: Tool = {
    activate () { },
    deactivate () { },
    reset () { }
  }

  editor.toolManager.registerTool('my_tool', myTool, buildToolConfigEntry('my_tool', ['polygon']))
  editor.toolManager.activateTool('my_tool')

  store.commit('workview/SHOW_MOBILE_BUTTONS')
  const wrapper = shallowMount(MobileButtonsOverlay, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('renders nothing when tool.isDrawing() === false', () => {
  const myTool: Tool = {
    activate () { },
    deactivate () { },
    reset () { },
    isDrawing () { return false }
  }

  editor.toolManager.registerTool('my_tool', myTool, buildToolConfigEntry('my_tool', ['polygon']))
  editor.toolManager.activateTool('my_tool')

  store.commit('workview/SHOW_MOBILE_BUTTONS')
  const wrapper = shallowMount(MobileButtonsOverlay, { localVue, propsData, store })
  expect(wrapper.html()).toEqual('')
})

it('matches snapshot', () => {
  const myTool: Tool = {
    activate () { },
    deactivate () { },
    reset () { },
    isDrawing () { return true }
  }

  editor.toolManager.registerTool('my_tool', myTool, buildToolConfigEntry('my_tool', ['polygon']))
  editor.toolManager.activateTool('my_tool')

  store.commit('workview/SHOW_MOBILE_BUTTONS')
  const wrapper = shallowMount(MobileButtonsOverlay, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
