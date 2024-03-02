import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { EditorCursor } from '@/engine/EditorCursor'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { selectCornerCursor } from '@/engine/plugins/click/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor, 'selectCursor').mockReturnValue(undefined)
})

describe('selectCornerCursor', () => {
  it('selects "n-resize" cursor for top-left corner', () => {
    selectCornerCursor(editor, 'top-left')
    expect(editor.selectCursor).toBeCalledWith(EditorCursor.NWResize)
  })

  it('selects "s-resize" cursor for top-right corner', () => {
    selectCornerCursor(editor, 'top-right')
    expect(editor.selectCursor).toBeCalledWith(EditorCursor.NEResize)
  })

  it('selects "w-resize" cursor for bottom-right corner', () => {
    selectCornerCursor(editor, 'bottom-right')
    expect(editor.selectCursor).toBeCalledWith(EditorCursor.SEResize)
  })

  it('selects "e-resize" cursor for bottom-left corner', () => {
    selectCornerCursor(editor, 'bottom-left')
    expect(editor.selectCursor).toBeCalledWith(EditorCursor.SWResize)
  })
})
