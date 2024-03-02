import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { addAnnotationsAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models/annotation'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let annotations: Annotation[]

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  annotations = [
    buildAnnotation(editor, {
      type: 'polygon',
      data: {
        path: [
          new EditablePoint({ x: 0, y: 0 }),
          new EditablePoint({ x: 0, y: 10 }),
          new EditablePoint({ x: 10, y: 10 }),
          new EditablePoint({ x: 10, y: 0 })
        ]
      }
    })!,
    buildAnnotation(editor, {
      type: 'polygon',
      data: {
        path: [
          new EditablePoint({ x: 5, y: 5 }),
          new EditablePoint({ x: 5, y: 15 }),
          new EditablePoint({ x: 15, y: 15 }),
          new EditablePoint({ x: 15, y: 5 })
        ]
      }
    })!
  ]
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get').mockReturnValue(annotations)
})

describe('do', () => {
  it('runs without any issue', async () => {
    const action = addAnnotationsAction(editor, annotations)
    jest.spyOn(editor.activeView.annotationManager, 'persistCreateAnnotation')
    await action.do()
    for (const annotation of annotations) {
      expect(editor.activeView.annotationManager.persistCreateAnnotation)
        .toHaveBeenCalledWith(annotation)
    }
  })
})

describe('undo', () => {
  it('runs without any issue', async () => {
    const action = addAnnotationsAction(editor, annotations)
    jest.spyOn(editor.activeView.annotationManager, 'persistDeleteAnnotation')
    await action.undo()
    for (const annotation of annotations) {
      expect(editor.activeView.annotationManager.persistDeleteAnnotation)
        .toHaveBeenCalledWith(annotation)
    }
  })
})
