import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

import { Graph } from './types'

interface SerializedGraph {
  graph: Graph
}

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): SerializedGraph {
    const { edges, nodes } = data as Graph
    return { graph: { edges, nodes } }
  },

  deserialize (rawData: SerializedGraph): AnnotationData {
    const { edges, nodes } = rawData.graph
    return { edges, nodes }
  }
}
