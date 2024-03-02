import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager, ToolContext } from '@/engine/managers'
import selectTool from '@/engine/plugins/select/selectTool'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let context: ToolContext

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor, 'selectCursor')
  context = { editor, handles: [] }
})

it('selects default cursor on activate', () => {
  selectTool.activate(context)
  expect(editor.selectCursor).toHaveBeenCalledWith('default-cur')
})
