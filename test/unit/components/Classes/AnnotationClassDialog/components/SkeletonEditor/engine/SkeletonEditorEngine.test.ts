import { buildSkeletonNodeType, buildSkeletonEdgeType } from 'test/unit/factories'
import { getFakeMouseEvent } from 'test/unit/factories/buildFakeMouseEvent'

import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import { SkeletonNodeType, SkeletonEdgeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

let engine: SkeletonEditorEngine

const mockEditor = () => {
  const engine = new SkeletonEditorEngine(jest.fn())
  const canvasParent = document.createElement('div')
  const canvas = document.createElement('canvas')
  canvasParent.appendChild(canvas)

  const contextMocks = {
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
  engine.width = 100
  engine.height = 100
  jest.spyOn(engine, 'requestRepaint').mockReturnValue(false)
  return engine
}

beforeEach(() => {
  engine = mockEditor()
})

describe('test creating nodes', () => {
  it('create a new node when no nodes/edges were created', () => {
    const mousedownEvent = getFakeMouseEvent('mousedown', { offsetX: 25, offsetY: 35 })
    expect(engine.nodes.length).toBe(0)
    engine.canvas.dispatchEvent(mousedownEvent)
    expect(engine.nodes).toHaveLength(1)
    expect(engine.nodes[0].label).toBe('1')
    expect(engine.nodes[0].position).toEqual({ x: 25, y: 35 })
  })

  it('should not allow to create a new node while editing skeleton', () => {
    engine.setEditing(true)
    const mousedownEvent = new MouseEvent('mousedown')
    expect(engine.nodes.length).toBe(0)
    engine.canvas.dispatchEvent(mousedownEvent)
    expect(engine.nodes.length).toBe(0)
  })

  it('should not create a new node when any node is moving', () => {
    const node1 = buildSkeletonNodeType({ internalId: 'Node 1', label: 'Node 1', position: { x: 10, y: 20 } })
    engine.setNodes([node1])
    engine.setMovingNode(node1)
    const mousedownEvent = new MouseEvent('mousedown')
    expect(engine.nodes).toHaveLength(1)
    engine.canvas.dispatchEvent(mousedownEvent)
    expect(engine.nodes).toHaveLength(1)
  })
})

describe('test moving nodes', () => {
  let nodes: SkeletonNodeType[]

  beforeEach(() => {
    nodes = [buildSkeletonNodeType({ internalId: 'Node 1', label: 'Node 1', position: { x: 10, y: 20 } })]
    engine.setNodes(nodes)
  })

  it('move the existing node', () => {
    engine.setMovingNode(nodes[0])
    expect(nodes[0].position).toEqual({ x: 10, y: 20 })
    const mousemoveEvent = getFakeMouseEvent('mousemove', { offsetX: 25, offsetY: 35 })
    engine.canvas.dispatchEvent(mousemoveEvent)
    expect(nodes[0].position).toEqual({ x: 25, y: 35 })
    expect(engine.requestRepaint).toBeCalled()
  })

  it('allow moving node while editing existing skeleton', () => {
    engine.setEditing(true)
    engine.setMovingNode(nodes[0])
    expect(nodes[0].position).toEqual({ x: 10, y: 20 })
    const mousemoveEvent = getFakeMouseEvent('mousemove', { offsetX: 25, offsetY: 35 })
    engine.canvas.dispatchEvent(mousemoveEvent)
    expect(nodes[0].position).toEqual({ x: 25, y: 35 })
    expect(engine.requestRepaint).toBeCalled()
  })
})

describe('tests connecting edges', () => {
  let nodes: SkeletonNodeType[]
  let edges: SkeletonEdgeType[]

  it('connect 2 nodes', () => {
    nodes = [
      buildSkeletonNodeType({ internalId: 'Node 1', label: 'Node 1', position: { x: 10, y: 20 } }),
      buildSkeletonNodeType({ internalId: 'Node 2', label: 'Node 2', position: { x: 30, y: 40 } })
    ]
    engine.setNodes(nodes)
    engine.setEdges([])

    engine.startDrawingEdgeFromNode(nodes[0])
    expect(engine.edges).toHaveLength(1)
    expect(engine.edges[engine.edges.length - 1].isDrawing).toBeTruthy()

    const mousemoveEvent1 = getFakeMouseEvent('mousemove', { offsetX: 80, offsetY: 80 })
    engine.canvas.dispatchEvent(mousemoveEvent1)
    expect(engine.drawingEdge).toBeDefined()
    expect(engine.drawingEdge!.nodes[0]).toEqual(nodes[0])
    expect(engine.drawingEdge!.nodes[1].position).toEqual({ x: 80, y: 80 })
    // Test refreshHighlightedNodes private method
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeFalsy()
    expect(engine.requestRepaint).toBeCalled()

    const mousemoveEvent2 = getFakeMouseEvent('mousemove', { offsetX: 40, offsetY: 50 })
    engine.canvas.dispatchEvent(mousemoveEvent2)
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeTruthy()
    expect(engine.requestRepaint).toBeCalled()

    const mousedownEvent = getFakeMouseEvent('mousedown', { offsetX: 40, offsetY: 50 })
    engine.canvas.dispatchEvent(mousedownEvent)
    expect(engine.edges).toHaveLength(1)
    expect(engine.edges[engine.edges.length - 1].isDrawing).toBeFalsy()
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeFalsy()
    expect(engine.requestRepaint).toBeCalled()
  })

  it('removes an existing edge if you create a new edge between connected nodes', () => {
    nodes = [
      buildSkeletonNodeType({ internalId: 'Node 1', label: 'Node 1', position: { x: 10, y: 20 } }),
      buildSkeletonNodeType({ internalId: 'Node 2', label: 'Node 2', position: { x: 30, y: 40 } })
    ]
    edges = [
      buildSkeletonEdgeType({ internalId: 'Edge 1', nodes })
    ]
    engine.setNodes(nodes)
    engine.setEdges(edges)

    engine.startDrawingEdgeFromNode(nodes[0])
    expect(engine.edges.length).toBe(2)
    expect(engine.edges[engine.edges.length - 1].isDrawing).toBeTruthy()

    const mousemoveEvent1 = getFakeMouseEvent('mousemove', { offsetX: 80, offsetY: 80 })
    engine.canvas.dispatchEvent(mousemoveEvent1)
    expect(engine.drawingEdge).toBeDefined()
    expect(engine.drawingEdge!.nodes[0]).toEqual(nodes[0])
    expect(engine.drawingEdge!.nodes[1].position).toEqual({ x: 80, y: 80 })
    // Test refreshHighlightedNodes private method
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeFalsy()
    expect(engine.requestRepaint).toBeCalled()

    const mousemoveEvent2 = getFakeMouseEvent('mousemove', { offsetX: 40, offsetY: 50 })
    engine.canvas.dispatchEvent(mousemoveEvent2)
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeTruthy()
    expect(engine.requestRepaint).toBeCalled()

    const mousedownEvent = getFakeMouseEvent('mousedown', { offsetX: 40, offsetY: 50 })
    engine.canvas.dispatchEvent(mousedownEvent)
    expect(engine.edges.length).toBe(0)
    expect(nodes[0].isHighlighted).toBeFalsy()
    expect(nodes[1].isHighlighted).toBeFalsy()
    expect(engine.requestRepaint).toBeCalled()
  })
})
