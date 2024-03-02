import { InferenceMetadata } from '@/engineCommon/backend'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'
import { PluginContext } from '@/engineV2/types'

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
