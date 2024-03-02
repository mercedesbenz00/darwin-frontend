import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMeasureRegionsPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ToolContext, ItemManager } from '@/engine/managers'
import { MeasureOverlayData } from '@/engine/models'
import {
  createBoundingBoxData,
  updateDrawingMeasuresOverlay,
  tool
} from '@/engine/plugins/boundingBox/tool'
import { CanvasPoint, Point } from '@/engineCommon/point'
import { rgbaString } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let context: ToolContext

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  context = {
    editor,
    handles: []
  }
  jest.spyOn(editor.activeView.camera, 'canvasViewToImageView')
    .mockImplementation((point) => new Point<'Image'>(point))
})

describe('createBoundingBoxData', () => {
  it('initializes BoundingBox annotation data from 2 points', () => {
    const p1 = new Point<'Canvas'>({ x: 0, y: 0 })
    const p2 = new Point<'Canvas'>({ x: 100, y: 200 })
    const boundingBoxData = createBoundingBoxData(context, p1, p2)
    expect(boundingBoxData).toEqual({
      topLeft: expect.objectContaining({ x: 0, y: 0 }),
      topRight: expect.objectContaining({ x: 100, y: 0 }),
      bottomRight: expect.objectContaining({ x: 100, y: 200 }),
      bottomLeft: expect.objectContaining({ x: 0, y: 200 })
    })
  })
})

describe('updateDrawingMeasuresOverlay', () => {
  let p1: CanvasPoint
  let p2: CanvasPoint

  beforeEach(() => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload())
    jest.spyOn(editor.activeView.camera, 'imageViewToCanvasView')
      .mockImplementation((point) => new Point<'Canvas'>(point))

    p1 = new Point<'Canvas'>({ x: 0, y: 0 })
    p2 = new Point<'Canvas'>({ x: 100, y: 200 })
  })

  it('updates measures overlay for drawing annotation', () => {
    const measureOverlayData: MeasureOverlayData = {
      id: editor.activeView.measureManager.DRAWING_ANNOTATION_ID,
      color: rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, 1),
      label: 'H: 200.00cm W: 100.00cm',
      measures: [{
        center: 'HOR',
        position: expect.objectContaining({ x: 50, y: 200 }),
        value: '100.00',
        unit: 'cm'
      }, {
        center: 'VER',
        position: expect.objectContaining({ x: 100, y: 100 }),
        value: '200.00',
        unit: 'cm'
      }]
    }

    jest.spyOn(
      editor.activeView.measureManager, 'updateOverlayForDrawingAnnotation'
    ).mockReturnValue(undefined)

    updateDrawingMeasuresOverlay(context, p1, p2)

    expect(
      editor.activeView.measureManager.updateOverlayForDrawingAnnotation
    ).toBeCalledWith(measureOverlayData)
  })

  it('removes measures overlay for drawing annotation when measure data is null', () => {
    jest.spyOn(editor.activeView, 'measureRegion', 'get').mockReturnValue(null)
    jest.spyOn(
      editor.activeView.measureManager,
      'removeOverlayForDrawingAnnotation'
    ).mockReturnValue(undefined)
    updateDrawingMeasuresOverlay(context, p1, p2)
    expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).toBeCalled()
  })
})

describe('tool', () => {
  describe('reset', () => {
    it('resets the tool', () => {
      jest.spyOn(editor, 'showMeasures', 'get').mockReturnValue(false)
      jest.spyOn(
        editor.activeView.measureManager,
        'removeOverlayForDrawingAnnotation'
      ).mockReturnValue(undefined)

      tool.reset(context)

      expect(tool.initialPoint).toBeUndefined()
      expect(tool.cursorPoint).toBeUndefined()
      expect(tool.saving).toBeFalsy()
      expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).not.toBeCalled()
    })

    it('resets the tool and removes measures overlay', () => {
      jest.spyOn(editor, 'showMeasures', 'get').mockReturnValue(true)
      jest.spyOn(
        editor.activeView.measureManager,
        'removeOverlayForDrawingAnnotation'
      ).mockReturnValue(undefined)

      tool.reset(context)

      expect(tool.initialPoint).toBeUndefined()
      expect(tool.cursorPoint).toBeUndefined()
      expect(tool.saving).toBeFalsy()
      expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).toBeCalled()
    })
  })
})
