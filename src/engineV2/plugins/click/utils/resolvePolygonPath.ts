import { ImagePoint } from '@/engineCommon/point'
import { ToolContext } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models/annotation'

export const resolvePolygonPath =
  (context: ToolContext, annotationData: AnnotationData): ImagePoint[] => {
    if ('frames' in annotationData) {
      const data = context.editor.activeView.annotationManager.inferVideoAnnotationDataOnly(
        annotationData,
        'polygon'
      )
      return data.path
    }
    return annotationData.path
  }
