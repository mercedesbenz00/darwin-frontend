import { ref, Ref, watch } from 'vue'

import { useEditorLayout } from '@/composables/useEditorV2'
import { View } from '@/engineV2/views'

export const useView = (id: string): Ref<View | null> => {
  const layout = useEditorLayout()

  const view = ref<View | null>(null)

  const handleViewChanged = (): void => {
    view.value = layout.value.views.get(id) || null
  }

  watch(() => layout.value, handleViewChanged, { immediate: true })

  return view as Ref<View | null>
}
