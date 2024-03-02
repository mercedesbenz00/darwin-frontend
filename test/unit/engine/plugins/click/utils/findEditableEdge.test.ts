import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { findEditableEdge } from '@/engine/plugins/click/utils'
import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let currentCrop: Rectangle<'Image'>

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  currentCrop = new Rectangle<'Image'>(
    new Point<'Image'>({ x: 40, y: 40 }),
    new Point<'Image'>({ x: 80, y: 80 })
  )
  jest.spyOn(editor.camera, 'imageViewToCanvasView')
    .mockImplementation(point => new Point<'Canvas'>(point))
})

describe('findEditableEdge', () => {
  it('returns "left" if it is the left edge', () => {
    const edge = findEditableEdge(editor, currentCrop, new Point<'Canvas'>({ x: 42, y: 60 }))
    expect(edge).toEqual(expect.objectContaining({ x: 42, y: 60 }))
  })

  it('returns "top" if it is the top edge', () => {
    const edge = findEditableEdge(editor, currentCrop, new Point<'Canvas'>({ x: 60, y: 42 }))
    expect(edge).toEqual(expect.objectContaining({ x: 60, y: 42 }))
  })

  it('returns "right" if it is the right edge', () => {
    const edge = findEditableEdge(editor, currentCrop, new Point<'Canvas'>({ x: 78, y: 60 }))
    expect(edge).toEqual(expect.objectContaining({ x: 78, y: 60 }))
  })

  it('returns "bottom" if it is the bottom edge', () => {
    const edge = findEditableEdge(editor, currentCrop, new Point<'Canvas'>({ x: 60, y: 78 }))
    expect(edge).toEqual(expect.objectContaining({ x: 60, y: 78 }))
  })

  it('returns undefined if it is none of edges', () => {
    const edge = findEditableEdge(editor, currentCrop, new Point<'Canvas'>({ x: 100, y: 100 }))
    expect(edge).toBeUndefined()
  })
})
