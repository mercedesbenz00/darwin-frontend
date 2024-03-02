import { AnnotationData } from '@/engine/models'

export const STRING_ANNOTATION_TYPE = 'string'

export interface String extends AnnotationData {
  sources: StringSource[]
}
export interface StringSource {
  id: string,
  ranges: [number, number][] | null
}

export const GRAPH_ANNOTATION_TYPE = 'graph'

export interface Graph extends AnnotationData {
  edges: GraphEdge[]
  nodes: GraphNode[]
}

export interface GraphEdge {
  end: string,
  start: string
}

export interface GraphNode {
  id: string
  name: string
}
