import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { View } from '@/engineV2/views'

export const useViewReadonly = (activeView: Ref<View>): Ref<boolean> => {
  const readonly = ref<boolean>(false)

  const handleReadonlyChange = (isReadonly: boolean): void => {
    readonly.value = isReadonly
  }

  watch(() => activeView.value, (newView, oldView) => {
    oldView?.off('readonly:changed', handleReadonlyChange)

    handleReadonlyChange(newView.readonly)

    newView.on('readonly:changed', handleReadonlyChange)
  }, { immediate: true })

  onBeforeUnmount(() => {
    activeView.value.off('readonly:changed', handleReadonlyChange)
  })

  return readonly as Ref<boolean>
}
