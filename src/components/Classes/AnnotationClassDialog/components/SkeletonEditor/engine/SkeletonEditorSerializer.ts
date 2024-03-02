import { v4 as uuidv4 } from 'uuid'

import { SkeletonMetadata } from '@/store/types'

import SkeletonEditorEngine from './SkeletonEditorEngine'
import { SkeletonEdgeType } from './types'

export default class SkeletonEditorSerializer {
  private engine!: SkeletonEditorEngine

  constructor (engine: SkeletonEditorEngine) {
    this.engine = engine
  }

  serialize (): SkeletonMetadata {
    const { edges, nodes, width, height } = this.engine
    if (nodes.length === 0) {
      return { edges: [], nodes: [] }
    }
    return {
      nodes: nodes.map(node => ({
        name: node.label!,
        x: node.position.x / width,
        y: node.position.y / height
      })),
      edges: edges.map(edge => ({ from: edge.nodes[0].label!, to: edge.nodes[1].label! }))
    }
  }

  deserialize (rawData: SkeletonMetadata): void {
    const { width, height } = this.engine
    const { nodes, edges } = rawData
    this.engine.setNodes(
      nodes.map(node => ({
        internalId: uuidv4(),
        label: node.name,
        position: {
          x: node.x * width,
          y: node.y * height
        },
        isMoving: false,
        isHighlighted: false
      }))
    )

    const newEdges: SkeletonEdgeType[] = []
    edges.forEach(edge => {
      const node1 = this.engine.nodes.find(node => node.label === edge.from)
      const node2 = this.engine.nodes.find(node => node.label === edge.to)
      if (!node1 || !node2) { return }

      newEdges.push({
        internalId: uuidv4(),
        nodes: [node1, node2],
        isDrawing: false
      })
    })
    this.engine.setEdges(newEdges)
  }
}
