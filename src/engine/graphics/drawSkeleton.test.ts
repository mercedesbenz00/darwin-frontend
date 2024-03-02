import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { drawSkeleton } from '@/engine/graphics'
import { ItemManager } from '@/engine/managers'
import { Skeleton } from '@/engine/plugins/skeleton/types'
import { EditablePoint } from '@/engineCommon/point'
import { RGBA } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('drawSkeleton', () => {
  let editor: Editor

  beforeEach(() => {
    const store = createTestStore()
    editor = new Editor(new ItemManager(store), store)
  })

  it('works', () => {
    const data: Skeleton = {
      nodes: [
        { name: 'a', point: new EditablePoint<'Image'>({ x: 0, y: 0 }), occluded: false },
        { name: 'b', point: new EditablePoint<'Image'>({ x: 10, y: 10 }), occluded: false }
      ],
      edges: [{ from: 'a', to: 'b' }]
    }

    const color: RGBA = { r: 0, g: 0, b: 0, a: 1.0 }
    drawSkeleton(editor.activeView, data.nodes, data.edges, color, null)

    const events = editor.activeView.annotationsLayer.context!.__getEvents()

    expect(events.find(e => e.type === 'stroke')!.props.path).toEqual([
      {
        props: { x: 0, y: 0 },
        transform: [1, 0, 0, 1, 0, 0],
        type: 'moveTo'
      },
      {
        props: { x: 10, y: 10 },
        transform: [1, 0, 0, 1, 0, 0],
        type: 'lineTo'
      }
    ])
  })
})
