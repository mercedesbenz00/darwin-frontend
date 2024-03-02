import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import {
  Annotation,
  AnnotationTypeRenderer,
  View,
  CreateAnnotationParams
} from '@/engine/models'
import { BoundingBoxRenderer } from '@/engine/plugins/boundingBox/BoundingBoxRenderer'
import { inferCentroid } from '@/engine/plugins/link/utils'
import { Point } from '@/engineCommon/point'

const buildAnnotationObject = (
  editor: Editor,
  params?: Partial<CreateAnnotationParams>
): Annotation => {
  const annotation = buildAnnotation(editor, params)
  return annotation!
}

export class TestRenderer extends AnnotationTypeRenderer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render (view: View, annotation: Annotation, _: boolean) {}
}

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

describe('inferCentroid', () => {
  test('returns cached centroid if it exists', () => {
    const annotation = buildAnnotationObject(editor)

    annotation.centroid = new Point<'Image'>({ x: 1, y: 2 })
    expect(inferCentroid(annotation, editor)).toEqual(new Point<'Image'>({ x: 1, y: 2 }))
  })

  test('is undefined if no renderer matches the annotation type', () => {
    const annotation = buildAnnotationObject(editor, { type: 'polygon' })
    expect(inferCentroid(annotation, editor)).toBeUndefined()
  })

  test('is undefined if the matched renderer is not a MainAnnotationTypeRenderer', () => {
    const annotation = buildAnnotationObject(editor, { type: 'text' })
    editor.activeView.renderManager.registerAnnotationRenderer('text', new TestRenderer(editor))
    expect(inferCentroid(annotation, editor)).toBeUndefined()
  })

  test('returns an inferred centroid point otherwise', () => {
    const annotation = buildAnnotationObject(editor)
    editor
      .activeView
      .renderManager
      .registerAnnotationRenderer(
        'bounding_box',
        new BoundingBoxRenderer(editor)
      )
    expect(inferCentroid(annotation, editor)).toEqual(new Point<'Image'>({ x: 5, y: 5 }))
  })
})
