import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { drawTemporarySkeleton } from '@/engine/graphics'
import { ItemManager } from '@/engine/managers'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { Point } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('drawTemporarySkeleton', () => {
  let editor: Editor

  beforeEach(() => {
    const store = createTestStore()
    editor = new Editor(new ItemManager(store), store)
  })

  it('works', () => {
    const initialPoint = new Point<'Canvas'>({ x: 0, y: 0 })
    const cursorPoint = new Point<'Canvas'>({ x: 50, y: 50 })

    const classPayload = buildAnnotationClassPayload({
      id: 5,
      annotation_types: ['skeleton'],
      metadata: {
        skeleton: {
          nodes: [{ name: 'a', x: 0, y: 0 }, { name: 'b', x: 10, y: 10 }],
          edges: [{ from: 'a', to: 'b' }]
        },
        _color: 'rgba(0, 0, 0, 1.0)'
      }
    })
    const annotationClass = new AnnotationClass(classPayload)
    drawTemporarySkeleton(editor.activeView, initialPoint, cursorPoint, annotationClass)

    const events = editor.activeView.annotationsLayer.context!.__getEvents()

    expect(events.find(e => e.type === 'stroke')!.props.path).toEqual([
      { type: 'beginPath', transform: [1, 0, 0, 1, 0, 0], props: {} },
      {
        type: 'moveTo',
        transform: [1, 0, 0, 1, 0, 0],
        props: { x: 0, y: 0 }
      },
      {
        type: 'lineTo',
        transform: [1, 0, 0, 1, 0, 0],
        props: { x: 500, y: 500 }
      }
    ]
    )
  })
})
