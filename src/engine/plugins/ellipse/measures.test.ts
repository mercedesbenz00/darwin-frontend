import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation, buildMeasureRegionsPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation, MeasureOverlayItem } from '@/engine/models'
import { measures } from '@/engine/plugins/ellipse/measures'
import { Ellipse } from '@/engine/plugins/ellipse/types'
import { EditablePoint, Point } from '@/engineCommon/point'
import { rgbaString } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let data: Ellipse

let measureOverlayLabel: string
let measureOverlayItems: MeasureOverlayItem[]

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  data = {
    center: new EditablePoint({ x: 10, y: 10 }),
    top: new EditablePoint({ x: 10, y: 0 }),
    right: new EditablePoint({ x: 20, y: 10 }),
    bottom: new EditablePoint({ x: 10, y: 20 }),
    left: new EditablePoint({ x: 0, y: 10 })
  }

  measureOverlayLabel = 'H: 20.00cm W: 20.00cm'
  measureOverlayItems = [{
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
})

describe('calculateMeasures', () => {
  beforeEach(() => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload())
    jest.spyOn(editor.camera, 'imageViewToCanvasView')
      .mockImplementation(point => new Point<'Canvas'>(point))
  })

  it('returns proper Measure overlay items', () => {
    const measureOverlays = measures.calculateMeasures(editor.activeView, data)
    expect(measureOverlays).toEqual({ label: measureOverlayLabel, measures: measureOverlayItems })
  })
})

describe('calculateDrawingMeasureOverlayData', () => {
  beforeEach(() => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload())
    jest.spyOn(editor.camera, 'imageViewToCanvasView')
      .mockImplementation(point => new Point<'Canvas'>(point))
  })

  it('returns proper MeasureOverlay data', () => {
    const measureOverlay = measures.calculateDrawingMeasureOverlayData(editor.activeView, data)
    expect(measureOverlay).toEqual({
      id: editor.activeView.measureManager.DRAWING_ANNOTATION_ID,
      color: rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, 1),
      label: measureOverlayLabel,
      measures: measureOverlayItems
    })
  })
})

describe('calculateMeasureOverlayData', () => {
  let annotation: Annotation

  const buildEllipseAnnotation = (editor: Editor) => {
    const annotation = buildAnnotation(editor, { data, type: 'ellipse' })
    return annotation!
  }

  beforeEach(() => {
    annotation = buildEllipseAnnotation(editor)
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload())
    jest.spyOn(editor.camera, 'imageViewToCanvasView')
      .mockImplementation(point => new Point<'Canvas'>(point))
  })

  it('returns proper MeasureOverlay data', () => {
    const data = measures.calculateMeasureOverlayData(editor.activeView, annotation)
    expect(data).toBeDefined()
    expect(data!.label).toEqual(measureOverlayLabel)
    expect(data!.measures).toEqual(measureOverlayItems)
  })

  it('returns null when measureRegion unit.x and unit.y is different', () => {
    jest.spyOn(
      editor.activeView,
      'measureRegion',
      'get'
    ).mockReturnValue(buildMeasureRegionsPayload({
      unit: { x: 'cm', y: 'cm`2' }
    }))
    expect(measures.calculateMeasureOverlayData(editor.activeView, annotation)).toBeNull()
  })

  it('returns null when measureRegion is null', () => {
    jest.spyOn(editor.activeView, 'measureRegion', 'get').mockReturnValue(null)
    expect(measures.calculateMeasureOverlayData(editor.activeView, annotation)).toBeNull()
  })
})
