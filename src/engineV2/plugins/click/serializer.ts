import { Click } from '@/engineCommon/backend'
import { Rectangle } from '@/engineCommon/rectangle'
import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models/annotation'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const clicker = data as { clicks: Click[], bbox: Rectangle<'Image'>, model: String}
    return {
      auto_annotate: {
        clicks: clicker.clicks || [],
        bbox: clicker.bbox,
        model: clicker.model
      }
    }
  },

  deserialize (rawData: any): AnnotationData {
    return {
      clicks: rawData.auto_annotate.clicks,
      bbox: rawData.auto_annotate.bbox,
      model: rawData.auto_annotate.model
    }
  },

  defaultData (data: any): AnnotationData | null {
    if (!data || !data.clicker) { return null }
    return {
      clicks: data.clicker.clickerSerializer,
      bbox: data.clicker.bbox,
      model: data.clicker.model
    }
  }
}
