import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import { linkTooling } from './linkTooling'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor, 'autoActivateTool')

  linkTooling(store, editor)
})

it('workview/PRESELECT_CLASS_ID should trigger editor.autoActivateTool', () => {
  store.commit('workview/PRESELECT_CLASS_ID')

  expect(editor.autoActivateTool).toHaveBeenCalled()
})
