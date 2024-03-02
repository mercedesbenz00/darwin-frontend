import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMeasureRegionsPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ToolContext, ItemManager } from '@/engine/managers'
import { MeasureOverlayData } from '@/engine/models'
import {
  createEllipseData,
  updateDrawingMeasuresOverlay,
  tool
} from '@/engine/plugins/ellipse/tool'
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

describe('createEllipseData', () => {
  it('initializes Ellipse annotation data from 2 points', () => {
    const p1 = new Point<'Canvas'>({ x: 0, y: 10 })
    const p2 = new Point<'Canvas'>({ x: 20, y: 10 })
    const ellipseData = createEllipseData(context, p1, p2)
    expect(ellipseData).toEqual({
      center: expect.objectContaining({ x: 10, y: 10 }),
      top: expect.objectContaining({ x: 10, y: 20 }),
      right: expect.objectContaining({ x: 20, y: 10 }),
      bottom: expect.objectContaining({ x: 10, y: 0 }),
      left: expect.objectContaining({ x: 0, y: 10 })
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
      .mockImplementation(point => new Point<'Canvas'>(point))

    p1 = new Point<'Canvas'>({ x: 0, y: 10 })
    p2 = new Point<'Canvas'>({ x: 20, y: 10 })
  })

  it('updates measures overlay for drawing annotation', () => {
    const measureOverlayData: MeasureOverlayData = {
      id: editor.activeView.measureManager.DRAWING_ANNOTATION_ID,
      color: rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, 1),
      label: 'H: 20.00cm W: 20.00cm',
      measures: [{
        center: 'HOR',
        position: expect.objectContaining({ x: 10, y: 20 }),
        value: '20.00',
        unit: 'cm'
      }, {
        center: 'VER',
        position: expect.objectContaining({ x: 20, y: 10 }),
        value: '20.00',
        unit: 'cm'
      }]
    }

    jest.spyOn(
      editor.activeView.measureManager,
      'updateOverlayForDrawingAnnotation'
    ).mockReturnValue(undefined)
    updateDrawingMeasuresOverlay(context, p1, p2)
    expect(
      editor.activeView.measureManager.updateOverlayForDrawingAnnotation
    ).toBeCalledWith(measureOverlayData)
  })

  it('removes measures overlay for drawing annotation when measure data is null', () => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(null)
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
      expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).toBeCalled()
    })
  })
})
