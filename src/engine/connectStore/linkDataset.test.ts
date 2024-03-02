import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import { linkDataset } from './linkDataset'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  linkDataset(store, editor)

  store.commit('aclass/SET_CLASSES', [buildAnnotationClassPayload({ id: 1 })])
})

it('workview/SET_DATASET sets hotkeys', () => {
  expect(editor.hotkeyManager).toEqual(expect.objectContaining({ datasetHotkeys: {} }))

  const dataset = buildDatasetPayload({ annotation_hotkeys: { 5: 'select_class:1' } })
  store.commit('workview/SET_DATASET', dataset)
  expect(editor.hotkeyManager).toEqual(
    expect.objectContaining({ datasetHotkeys: expect.objectContaining(dataset.annotation_hotkeys) })
  )
})
