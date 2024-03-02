import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { addVertexAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models/annotation'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let annotation: Annotation

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  annotation = buildAnnotation(editor, {
    type: 'polygon',
    data: {
      path: [
        new EditablePoint({ x: 0, y: 0 }),
        new EditablePoint({ x: 0, y: 10 }),
        new EditablePoint({ x: 10, y: 10 }),
        new EditablePoint({ x: 10, y: 0 })
      ],
      additionalPaths: [
        [
          new EditablePoint({ x: 0, y: 0 }),
          new EditablePoint({ x: 0, y: 5 }),
          new EditablePoint({ x: 5, y: 5 }),
          new EditablePoint({ x: 5, y: 0 })
        ]
      ]
    }
  })!
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([annotation])
})

describe('do', () => {
  it('runs without any issue', async () => {
    const { data: { path, additionalPaths } } = annotation as AnnotationData
    const action = addVertexAction(editor, annotation, path, 0, path[0])
    jest.spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
    await action.do()
    expect(path.length).toBe(5)
    expect(additionalPaths[0].length).toBe(4)
    expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalledWith(annotation)
  })
})

describe('undo', () => {
  it('runs without any issue', async () => {
    const { data: { path, additionalPaths } } = annotation as AnnotationData
    const action = addVertexAction(editor, annotation, path, 0, path[0])
    jest.spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
    await action.undo()
    expect(path.length).toBe(3)
    expect(additionalPaths[0].length).toBe(4)
    expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalledWith(annotation)
  })
})
