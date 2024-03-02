import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { hasAttributesSubAnnotation } from '@/engine/utils'

let store: ReturnType<typeof createTestStore>
let editor: Editor

const localVue = createLocalVue()
localVue.use(Vuex)

const initEditor = (store: ReturnType<typeof createTestStore>) => {
  const editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
})

describe('hasAttributesSubAnnotation', () => {
  it('returns true if annotation has attributes sub-annotation', () => {
    const annotationClass = buildAnnotationClassPayload({
      id: 1,
      team_id: 1,
      annotation_types: ['polygon', 'attributes']
    })

    store.commit('aclass/SET_CLASSES', [annotationClass])
    editor.activeView.setAnnotationClasses(store.state.aclass.classes)
    const annotation = buildAnnotation(editor, { classId: annotationClass.id })
    expect(annotation).toBeTruthy()
    expect(hasAttributesSubAnnotation(annotation!)).toBeTruthy()
  })

  it("returns false if annotation doesn't have attributes sub-annotation", () => {
    const annotationClass = buildAnnotationClassPayload({ id: 1, team_id: 1 })

    store.commit('aclass/SET_CLASSES', [annotationClass])
    const annotation = buildAnnotation(editor, { classId: annotationClass.id })
    expect(annotation).toBeTruthy()
    expect(hasAttributesSubAnnotation(annotation!)).toBeFalsy()
  })
})
