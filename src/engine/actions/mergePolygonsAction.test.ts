import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { mergePolygonsAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models/annotation'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let firstAnnotation: Annotation
let secondAnnotation: Annotation

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  firstAnnotation = buildAnnotation(editor, {
    type: 'polygon',
    data: {
      path: [
        new EditablePoint({ x: 0, y: 0 }),
        new EditablePoint({ x: 0, y: 10 }),
        new EditablePoint({ x: 10, y: 10 }),
        new EditablePoint({ x: 10, y: 0 })
      ]
    }
  })!
  secondAnnotation = buildAnnotation(editor, {
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
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get').mockReturnValue([
    firstAnnotation,
    secondAnnotation
  ])
  jest.spyOn(editor.activeView.annotationManager, 'persistCreateAnnotation')
    .mockResolvedValue(buildAnnotation(editor, { id: '1' }))
  jest
    .spyOn(editor.activeView.annotationManager, 'persistDeleteAnnotation')
    .mockResolvedValue('1')
  jest.spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
})

describe('do', () => {
  it('runs without any issue', async () => {
    expect.assertions(3)
    const action = mergePolygonsAction(editor, firstAnnotation, secondAnnotation)
    jest
      .spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
      .mockImplementation(async (annotation: Annotation) => {
        expect((annotation.data as AnnotationData).path).toEqual([
          new EditablePoint({ x: 15, y: 15 }),
          new EditablePoint({ x: 15, y: 5 }),
          new EditablePoint({ x: 10, y: 5 }),
          new EditablePoint({ x: 10, y: 0 }),
          new EditablePoint({ x: 0, y: 0 }),
          new EditablePoint({ x: 0, y: 10 }),
          new EditablePoint({ x: 5, y: 10 }),
          new EditablePoint({ x: 5, y: 15 })
        ])
        return await Promise.resolve(annotation)
      })
    await action.do()
    expect(editor.activeView.annotationManager.persistDeleteAnnotation)
      .toHaveBeenCalledWith(secondAnnotation)
    expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalled()
  })
})

describe('undo', () => {
  it('runs without any issue', async () => {
    expect.assertions(3)
    const action = mergePolygonsAction(editor, firstAnnotation, secondAnnotation)
    jest
      .spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
      .mockImplementation(async (annotation: Annotation) => {
        expect((annotation.data as AnnotationData).path).toEqual([
          new EditablePoint({ x: 0, y: 0 }),
          new EditablePoint({ x: 0, y: 10 }),
          new EditablePoint({ x: 10, y: 10 }),
          new EditablePoint({ x: 10, y: 0 })
        ])
        return await Promise.resolve(annotation)
      })
    await action.undo()
    expect(editor.activeView.annotationManager.persistCreateAnnotation)
      .toHaveBeenCalledWith(secondAnnotation)
    expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalled()
  })
})
