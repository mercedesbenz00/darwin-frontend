import { Annotation, ImageSubAnnotation } from '@/engineV2/models'
import { Text } from '@/engineV2/plugins/text/types'

export function mergeSubAnnotations (
  firstAnnotation: Annotation,
  secondAnnotation: Annotation
): ImageSubAnnotation[] {
  const subAnnotations: ImageSubAnnotation[] = []
  for (const firstSub of firstAnnotation.subAnnotations as ImageSubAnnotation[]) {
    const secondSub = (secondAnnotation.subAnnotations as ImageSubAnnotation[])
      .find((sub) => sub.type === firstSub.type)

    if (!secondSub) {
      // if the second annotation does not have the same type then there is nothing to merge
      subAnnotations.push(firstSub)
      continue
    }
    if (firstSub.type === 'text') {
      const firstText = (firstSub.data as Text).text
      const secondText = (secondSub.data as Text).text
      let newText
      if (firstText && !secondText) { newText = firstText }
      if (firstText && secondText) { newText = `${firstText} ${secondText}` }
      if (!firstText && secondText) { newText = secondText }
      subAnnotations.push(firstSub.shallowClone({ data: { text: newText } }))
    } else {
      subAnnotations.push(firstSub)
    }
  }
  return subAnnotations
}
