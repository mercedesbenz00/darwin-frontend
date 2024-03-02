import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMeasureRegionsPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ToolContext, ItemManager } from '@/engine/managers'
import { MeasureOverlayData } from '@/engine/models'
import { tool } from '@/engine/plugins/polygon/tool'
import { Point } from '@/engineCommon/point'
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

describe('updateDrawingMeasuresOverlay', () => {
  beforeEach(() => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload())
    jest.spyOn(editor.activeView.camera, 'imageViewToCanvasView')
      .mockImplementation(point => new Point<'Canvas'>(point))

    tool.currentPath = [
      new Point<'Image'>({ x: 10, y: 10 }),
      new Point<'Image'>({ x: 100, y: 10 }),
      new Point<'Image'>({ x: 100, y: 100 })
    ]
    tool.previousMouseMovePosition = new Point<'Image'>({ x: 10, y: 100 })
  })

  it('updates measures overlay for drawing annotation', () => {
    const measureOverlayData: MeasureOverlayData = {
      id: editor.activeView.measureManager.DRAWING_ANNOTATION_ID,
      color: rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, 1),
      label: 'H: 90.00cm W: 90.00cm',
      measures: [{
        center: 'HOR',
        position: expect.objectContaining({ x: 55, y: 25 }),
        value: '(90.00 cm, 90.00 cm)',
        unit: ''
      }]
    }

    jest.spyOn(
      editor.activeView.measureManager,
      'updateOverlayForDrawingAnnotation'
    ).mockReturnValue(undefined)
    tool.updateDrawingMeasuresOverlay(context)
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
    tool.updateDrawingMeasuresOverlay(context)
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

      expect(tool.pointOnLine).toBeNull()
      expect(tool.initialMouseDownPosition).toBeUndefined()
      expect(tool.previousMouseMovePosition).toBeUndefined()
      expect(tool.vertexMoving).toBeUndefined()
      expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).not.toBeCalled()
    })

    it('resets the tool and removes measures overlay', () => {
      jest.spyOn(editor, 'showMeasures', 'get').mockReturnValue(true)
      jest.spyOn(
        editor.activeView.measureManager,
        'removeOverlayForDrawingAnnotation'
      ).mockReturnValue(undefined)

      tool.reset(context)

      expect(tool.pointOnLine).toBeNull()
      expect(tool.initialMouseDownPosition).toBeUndefined()
      expect(tool.previousMouseMovePosition).toBeUndefined()
      expect(tool.vertexMoving).toBeUndefined()
      expect(editor.activeView.measureManager.removeOverlayForDrawingAnnotation).toBeCalled()
    })
  })
})
