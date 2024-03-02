import { buildSkeletonEdgeType, buildSkeletonNodeType } from 'test/unit/factories'

import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import SkeletonEditorRenderer from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorRenderer'

let engine: SkeletonEditorEngine
let contextMocks: {
  lineWidth: number,
  lineCap: string,
  lineJoin: string,
  strokeStyle: string,
  clearRect: Function,
  beginPath: Function,
  moveTo: Function,
  lineTo: Function,
  stroke: Function,
  closePath: Function
}

const mockEditor = () => {
  const engine = new SkeletonEditorEngine(jest.fn())
  const canvas = document.createElement('canvas')

  contextMocks = {
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    strokeStyle: '',
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn()
  }
  canvas.getContext = jest.fn().mockReturnValue(contextMocks)
  engine.setMainCanvas(canvas)
  return engine
}

beforeEach(() => { engine = mockEditor() })

it('tests render with edge', () => {
  const renderer = new SkeletonEditorRenderer(engine)
  engine.setStrokeColor('#000000')
  engine.setEdges([
    buildSkeletonEdgeType({
      nodes: [
        buildSkeletonNodeType({ position: { x: 0, y: 0 } }),
        buildSkeletonNodeType({ position: { x: 100, y: 100 } })
      ]
    })
  ])
  renderer.render()

  const { canvas } = engine
  expect(canvas.getContext).toBeCalledWith('2d')
  expect(contextMocks.clearRect).toBeCalledWith(0, 0, engine.width, engine.height)
  expect(contextMocks.lineWidth).toBe(1.5)
  expect(contextMocks.lineCap).toBe('round')
  expect(contextMocks.lineJoin).toBe('round')
  expect(contextMocks.strokeStyle).toBe('#000000')
  expect(contextMocks.beginPath).toBeCalled()
  expect(contextMocks.moveTo).toBeCalledWith(0, 0)
  expect(contextMocks.lineTo).toBeCalledWith(100, 100)
  expect(contextMocks.stroke).toBeCalled()
  expect(contextMocks.closePath).toBeCalled()
})
