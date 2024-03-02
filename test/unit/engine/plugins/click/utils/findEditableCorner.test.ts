import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { findEditableCorner } from '@/engine/plugins/click/utils'
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
    .mockImplementation((point) => new Point<'Canvas'>(point))
})

describe('findEditableCorner', () => {
  it('returns "top-left" if it is the left corner', () => {
    const cornerInfo = findEditableCorner(editor, currentCrop, new Point<'Canvas'>({ x: 42, y: 42 }))
    expect(cornerInfo).toBeDefined()
    const { corner, position } = cornerInfo!
    expect(corner).toEqual(expect.objectContaining({ x: 40, y: 40 }))
    expect(position).toEqual('top-left')
  })

  it('returns "top-right" if it is the top-right corner', () => {
    const cornerInfo = findEditableCorner(editor, currentCrop, new Point<'Canvas'>({ x: 82, y: 38 }))
    expect(cornerInfo).toBeDefined()
    const { corner, position } = cornerInfo!
    expect(corner).toEqual(expect.objectContaining({ x: 80, y: 40 }))
    expect(position).toEqual('top-right')
  })

  it('returns "bottom-right" if it is the bottom-right corner', () => {
    const cornerInfo = findEditableCorner(editor, currentCrop, new Point<'Canvas'>({ x: 82, y: 78 }))
    expect(cornerInfo).toBeDefined()
    const { corner, position } = cornerInfo!
    expect(corner).toEqual(expect.objectContaining({ x: 80, y: 80 }))
    expect(position).toEqual('bottom-right')
  })

  it('returns "bottom-left" if it is the bottom-left corner', () => {
    const cornerInfo = findEditableCorner(editor, currentCrop, new Point<'Canvas'>({ x: 38, y: 78 }))
    expect(cornerInfo).toBeDefined()
    const { corner, position } = cornerInfo!
    expect(corner).toEqual(expect.objectContaining({ x: 40, y: 80 }))
    expect(position).toEqual('bottom-left')
  })

  it('returns undefined if it is none of corners', () => {
    const cornerInfo = findEditableCorner(editor, currentCrop, new Point<'Canvas'>({ x: 100, y: 100 }))
    expect(cornerInfo).toBeUndefined()
  })
})
