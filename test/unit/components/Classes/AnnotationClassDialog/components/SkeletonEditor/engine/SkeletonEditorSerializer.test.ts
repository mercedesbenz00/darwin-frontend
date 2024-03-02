import * as uuid from 'uuid'

import { buildSkeletonNodeType, buildSkeletonEdgeType } from 'test/unit/factories'

import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import SkeletonEditorSerializer from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorSerializer'

let engine: SkeletonEditorEngine
jest.mock('uuid')

const mockEditor = () => {
  const engine = new SkeletonEditorEngine(jest.fn())

  engine.width = 100
  engine.height = 100

  return engine
}

beforeEach(() => { engine = mockEditor() })

it('test serialization', () => {
  const serializer = new SkeletonEditorSerializer(engine)

  const node1 = buildSkeletonNodeType({ label: 'node1', position: { x: 40, y: 40 } })
  const node2 = buildSkeletonNodeType({ label: 'node2', position: { x: 50, y: 50 } })
  engine.setNodes([node1, node2])
  engine.setEdges([buildSkeletonEdgeType({ nodes: [node1, node2] })])

  expect(serializer.serialize()).toEqual({
    nodes: [{ name: 'node1', x: 0.4, y: 0.4 }, { name: 'node2', x: 0.5, y: 0.5 }],
    edges: [{ from: 'node1', to: 'node2' }]
  })
})

it('test serialization when there are no nodes', () => {
  const serializer = new SkeletonEditorSerializer(engine)
  expect(serializer.serialize()).toEqual({ edges: [], nodes: [] })
})

it('test deserialization set nodes correctly', () => {
  const fakeUUID = 'mocked uuid'
  jest.spyOn(engine, 'setNodes').mockReturnValue(undefined)
  jest.spyOn(uuid, 'v4').mockReturnValue(fakeUUID)

  const serializer = new SkeletonEditorSerializer(engine)
  serializer.deserialize({
    nodes: [{ name: 'node1', x: 0.4, y: 0.4 }, { name: 'node2', x: 0.5, y: 0.5 }],
    edges: [{ from: 'node1', to: 'node2' }]
  })

  const nodes = [
    { internalId: fakeUUID, label: 'node1', position: { x: 40, y: 40 }, isHighlighted: false, isMoving: false },
    { internalId: fakeUUID, label: 'node2', position: { x: 50, y: 50 }, isHighlighted: false, isMoving: false }
  ]
  expect(engine.setNodes).toHaveBeenCalledWith(nodes)
})

it('test deserialization set edges correctly', () => {
  const fakeUUID = 'mocked uuid'
  jest.spyOn(engine, 'setEdges').mockReturnValue(undefined)
  jest.spyOn(uuid, 'v4').mockReturnValue(fakeUUID)

  const serializer = new SkeletonEditorSerializer(engine)
  serializer.deserialize({
    nodes: [{ name: 'node1', x: 0.4, y: 0.4 }, { name: 'node2', x: 0.5, y: 0.5 }],
    edges: [{ from: 'node1', to: 'node2' }]
  })

  const nodes = [
    { internalId: fakeUUID, label: 'node1', position: { x: 40, y: 40 }, isHighlighted: false, isMoving: false },
    { internalId: fakeUUID, label: 'node2', position: { x: 50, y: 50 }, isHighlighted: false, isMoving: false }
  ]
  expect(engine.setEdges).toHaveBeenCalledWith([{
    internalId: fakeUUID,
    nodes,
    isDrawing: false
  }])
})
