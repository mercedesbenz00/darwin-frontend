import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { useEditorLayout } from '@/composables/useEditorV2'
import { View } from '@/engineV2/views'

export const useActiveView = (): Ref<View> => {
  const layout = useEditorLayout()

  const activeView = ref(layout.value.activeView)

  const handleActiveViewChanged = (view: View): void => {
    activeView.value = view
  }

  watch(() => layout.value, (newLayout, oldLayout) => {
    oldLayout?.off('activeView:changed', handleActiveViewChanged)

    handleActiveViewChanged(newLayout.activeView)

    newLayout?.on('activeView:changed', handleActiveViewChanged)
  }, { immediate: true })

  onBeforeUnmount(() => {
    layout.value.off('activeView:changed', handleActiveViewChanged)
  })

  return activeView as Ref<View>
}
