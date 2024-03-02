import { Editor } from '@/engineV2/editor'
import { AnnotationOverlayer } from '@/engineV2/managers'
import {
  Annotation,
  AnnotationData
} from '@/engineV2/models'
import { AttributePayload, InputTag } from '@/store/types'

import { Attributes } from './types'

export const overlayer: AnnotationOverlayer = {
  render (editor: Editor, annotation: Annotation, data: AnnotationData): InputTag[] {
    const attributesData = data as Attributes
    const tags = attributesData.attributes

    const attributes: AttributePayload[] | undefined =
      editor.store.getters['aclass/attributesByAnnotationClassId'][annotation.classId]

    // attributes not loaded yet. Rendering will have to be called again
    if (!attributes) { return [] }

    return tags
      .map(tag => attributes.find(entry => entry.id! === tag))
      .filter(entry => entry !== undefined)
      .map(entry => ({ text: entry!.name, style: `background: ${entry!.color};` }))
  }
}
