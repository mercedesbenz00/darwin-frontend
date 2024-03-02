import { Editor } from '@/engineV2/editor'
import { Annotation, isVideoSubAnnotations } from '@/engineV2/models'
import { Attributes } from '@/engineV2/plugins/attributes/types'
import { AttributePayload, InputTag } from '@/store/types'

export const tagFromAttribute = (attribute: AttributePayload): InputTag => {
  return {
    id: attribute.id,
    text: attribute.name,
    style: `background: ${attribute.color}`
  }
}

export const getTagsFromAnnotation = (annotation: Annotation, editor: Editor): InputTag[] => {
  let existingAttributes
  if (isVideoSubAnnotations(annotation.subAnnotations)) {
    const subs = editor.activeView.annotationManager.inferVideoSubAnnotations(annotation)
    existingAttributes = subs.find(ann => ann.type === 'attributes')
  } else {
    existingAttributes = annotation.subAnnotations.find(ann => ann.type === 'attributes')
  }

  if (!existingAttributes) {
    return []
  }

  const attributes: AttributePayload[] | undefined =
    editor.store.getters['aclass/attributesByAnnotationClassId'][annotation.classId]

  if (!attributes) {
    return []
  }

  const attrsByKey = attributes.reduce((acc: any, cur: AttributePayload) => {
    acc[cur.id!] = cur
    return acc
  }, {})

  const attributesData = existingAttributes.data as Attributes
  const tags = attributesData.attributes
    .filter(tag => !!attrsByKey[tag])
    .map(tag => tagFromAttribute(attrsByKey[tag]))

  return tags
}
