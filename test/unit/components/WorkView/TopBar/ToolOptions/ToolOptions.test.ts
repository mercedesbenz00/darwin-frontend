import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import ToolOptions from '@/components/WorkView/TopBar/ToolOptions/ToolOptions.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const initEditor = (store: ReturnType<typeof createTestStore>) => {
  const editor = new Editor(new ItemManager(store), store)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

let editor: Editor

let propsData: {
  editor: Editor
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
  propsData = { editor }
})

describe('when brush_tool is selected', () => {
  beforeEach(() => { editor.toolManager.activateTool('brush_tool') })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ToolOptions, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when edit_tool is selected', () => {
  beforeEach(() => { editor.toolManager.activateTool('edit_tool') })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ToolOptions, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
