import { Editor } from '@/engine/editor'
import { AnnotationOverlayer } from '@/engine/managers'
import { Annotation, AnnotationData } from '@/engine/models'

import { Text } from './types'

export const overlayer: AnnotationOverlayer = {
  render (
    editor: Editor,
    annotation: Annotation,
    data: AnnotationData
  ): { text: string, style: string }[] {
    const textData = data as Text
    const text = textData.text
    if (!text || text.length === 0) {
      return []
    }
    return [{ text: text, style: 'background: white;' }]
  }
}
