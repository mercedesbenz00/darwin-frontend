import { PluginContext } from '@/engine/editor'
import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models/annotation'
import { InferenceMetadata } from '@/engineCommon/backend'

export interface InferenceSerializer extends AnnotationTypeSerializer {
  context?: PluginContext
}

export const serializer: InferenceSerializer = {
  serialize (data: AnnotationData & { inference: InferenceMetadata }): any {
    return {
      confidence: data.inference.confidence,
      model: data.inference.model
    }
  },

  deserialize (rawData: any): AnnotationData | null {
    return {
      confidence: rawData.inference.confidence,
      model: rawData.inference.model
    }
  }
}
