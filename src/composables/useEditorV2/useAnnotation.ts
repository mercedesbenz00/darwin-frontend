import { ref, Ref, watch } from 'vue'

import { useAnnotations, useActiveView } from '@/composables/useEditorV2'
import { Annotation } from '@/engineV2/models'

export const useAnnotation = (annotationId: Annotation['id']): Ref<Annotation | undefined> => {
  const activeView = useActiveView()
  const annotations = useAnnotations(activeView)

  const annotation = ref<Annotation | undefined>()

  watch(() => annotations.value, (annotations) => {
    annotation.value = annotations.find(annotation => annotation.id === annotationId)
  }, { immediate: true })

  return annotation
}
