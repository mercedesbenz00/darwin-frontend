import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { EllipseRenderer } from '@/engine/plugins/ellipse/EllipseRenderer'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let renderer: EllipseRenderer

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  renderer = new EllipseRenderer(editor)
})

describe('interpolate', () => {
  it('should keep the same position in the case of ellipse rotation ', () => {
    const prev = {
      bottom: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 5,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      top: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      })
    }

    const next = {
      top: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 5,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      bottom: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      })
    }

    const res = renderer.interpolate(
      prev,
      next,
      {
        algorithm: 'linear-1.1',
        interpolationFactor: 0.5
      }
    )

    expect(res).toEqual({
      top: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 5,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      bottom: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      })
    })
  })

  it('should interpolate ellipses position', () => {
    const prev = {
      top: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      bottom: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 5,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 1,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      })
    }

    const next = {
      top: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      bottom: new EditablePoint<'Image'>({
        x: 20,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 15,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 20,
        y: 5
      })
    }

    const res = renderer.interpolate(
      prev,
      next,
      {
        algorithm: 'linear-1.1',
        interpolationFactor: 0.5
      }
    )

    expect(res).toEqual({
      top: new EditablePoint<'Image'>({
        x: 5.5,
        y: 5
      }),
      bottom: new EditablePoint<'Image'>({
        x: 15,
        y: 5
      }),
      center: new EditablePoint<'Image'>({
        x: 10,
        y: 5
      }),
      left: new EditablePoint<'Image'>({
        x: 5.5,
        y: 5
      }),
      right: new EditablePoint<'Image'>({
        x: 15,
        y: 5
      })
    })
  })
})
