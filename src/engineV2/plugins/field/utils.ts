import { euclideanDistance } from '@/engineCommon/algebra'
import { IPoint } from '@/engineCommon/point'

import { GraphEdge, GraphNode } from './types'

export const findShortestSegment = (points1: IPoint[], points2: IPoint[]) => {
  let minDistance = Number.POSITIVE_INFINITY
  let i1 = -1
  let i2 = -1
  for (let i = 0; i < points1.length; i++) {
    const p1 = points1[i]
    for (let j = 0; j < points2.length; j++) {
      const p2 = points2[j]
      const dist = euclideanDistance(p1, p2)
      if (dist < minDistance) {
        minDistance = dist
        i1 = i
        i2 = j
      }
    }
  }
  return { start: points1[i1], end: points2[i2] }
}

export const findCloserPoint = (target: IPoint, points: IPoint[]) => {
  let minDistance = Number.POSITIVE_INFINITY
  let index = -1
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const dist = euclideanDistance(point, target)
    if (dist < minDistance) {
      minDistance = dist
      index = i
    }
  }
  return points[index]
}

export const findEdgeNodeAnnotations = (
  edge: GraphEdge,
  nodes: GraphNode[],
  annotations: any[]
) => {
  const startNode = nodes.find(n => n.name === edge.start)
  if (!startNode) { return }

  const endNode = nodes.find(n => n.name === edge.end)
  if (!endNode) { return }

  const startNodeAnnotation = annotations.find(a => a.id === startNode.id)
  if (!startNodeAnnotation) { return }

  const endNodeAnnotation = annotations.find(a => a.id === endNode.id)
  if (!endNodeAnnotation) { return }

  return { startNodeAnnotation, endNodeAnnotation }
}
