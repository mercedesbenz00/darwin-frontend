import { ToolContext } from '@/engine/managers'
import { AnnotationData } from '@/engine/models/annotation'
import { ImagePoint } from '@/engineCommon/point'

export const resolvePolygonPath =
  (context: ToolContext, annotationData: AnnotationData): ImagePoint[] => {
    if ('frames' in annotationData) {
      const data = context.editor.inferVideoAnnotationDataOnly(annotationData, 'polygon')
      return data.path
    }
    return annotationData.path
  }
