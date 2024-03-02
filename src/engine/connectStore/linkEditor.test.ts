import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildPresetPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import { linkEditor } from './linkEditor'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  linkEditor(store, editor)
})

it('workview/TOGGLE_MEASURES should trigger View.annotationsLayer.changed', () => {
  jest.spyOn(editor.activeView.annotationsLayer, 'changed')

  store.commit('workview/TOGGLE_MEASURES')

  expect(editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
})

it('workview/SET_CLICKER_EPSILON should trigger Editor.callCommand', () => {
  jest.spyOn(editor, 'callCommand')

  store.commit('workview/SET_CLICKER_EPSILON')

  expect(editor.callCommand).toHaveBeenCalledWith('clicker_tool.apply_clicker_epsilon')
})

it('workview/SET_ACTIVE_MANIPULATION_PRESET_ID should trigger Editor.callCommand', () => {
  const preset = buildPresetPayload({ id: 1 })
  store.commit('workview/PUSH_PRESET', preset)

  jest.spyOn(editor.activeView, 'setImageFilter')

  store.commit('workview/SET_ACTIVE_MANIPULATION_PRESET_ID', 1)

  expect(editor.activeView.setImageFilter).toHaveBeenCalled()
})
