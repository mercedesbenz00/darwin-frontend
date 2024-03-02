import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { BoundingBoxRenderer } from '@/engine/plugins/boundingBox/BoundingBoxRenderer'
import { PolygonRenderer } from '@/engine/plugins/polygon/PolygonRenderer'
import { Annotation } from '@/store/types'

import { getBBox } from './calcBBox'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

describe('bounding_box annotation type', () => {
  let annotation: Annotation

  beforeEach(() => {
    annotation = buildAnnotation(editor, {}) as Annotation

    editor.activeView.renderManager.registerAnnotationRenderer(
      'bounding_box',
      new BoundingBoxRenderer(editor)
    )
  })

  it('should return centroid of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      x: 5,
      y: 5
    }))
  })

  it('should return width of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      width: 10
    }))
  })

  it('should return height of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      height: 10
    }))
  })
})

describe('polygon annotation type', () => {
  let annotation: Annotation

  beforeEach(() => {
    annotation = buildAnnotation(editor, {
      type: 'polygon',
      data: {
        path: [{ x: 0, y: 0 }, { x: 21, y: 30 }, { x: 0, y: 36 }]
      }
    }) as Annotation

    editor.activeView.renderManager.registerAnnotationRenderer(
      'polygon',
      new PolygonRenderer(editor)
    )
  })

  it('should return centroid of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      x: 10.5,
      y: 18
    }))
  })

  it('should return width of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      width: 21
    }))
  })

  it('should return height of the annotation', () => {
    const res = getBBox(editor.activeView, annotation)

    expect(res).toEqual(expect.objectContaining({
      height: 36
    }))
  })

  describe('with additionalPaths', () => {
    beforeEach(() => {
      annotation = buildAnnotation(editor, {
        type: 'polygon',
        data: {
          path: [{ x: 0, y: 0 }, { x: 21, y: 30 }, { x: 0, y: 36 }],
          additionalPaths: [[
            { x: 40, y: 3 }, { x: 45, y: 33 }, { x: 20, y: 36 }
          ]]
        }
      }) as Annotation
    })

    it('should return centroid of the annotation', () => {
      const res = getBBox(editor.activeView, annotation)

      expect(res).toEqual(expect.objectContaining({
        x: 22.5,
        y: 18
      }))
    })

    it('should return width of the annotation', () => {
      const res = getBBox(editor.activeView, annotation)

      expect(res).toEqual(expect.objectContaining({
        width: 45
      }))
    })

    it('should return height of the annotation', () => {
      const res = getBBox(editor.activeView, annotation)

      expect(res).toEqual(expect.objectContaining({
        height: 36
      }))
    })
  })
})
