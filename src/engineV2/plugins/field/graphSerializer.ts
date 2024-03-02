import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

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
