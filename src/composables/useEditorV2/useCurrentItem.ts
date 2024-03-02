import { ref, Ref, onBeforeUnmount } from 'vue'

import { useEditorV2 } from '@/composables/useEditorV2'
import { V2DatasetItemPayload } from '@/store/types'

export const useCurrentItem = (): Ref<V2DatasetItemPayload | null> => {
  const { resolveEditor } = useEditorV2()

  const editor = resolveEditor()
  if (!editor?.value) { throw new Error('Editor is not set!') }

  const item = ref(editor.value.itemManager.currentItem)

  const handleItemChanged = (currentItem: V2DatasetItemPayload | null): void => {
    item.value = currentItem
  }

  editor.value.itemManager.on('item:changed', handleItemChanged)

  onBeforeUnmount(() => {
    editor.value.itemManager.off('item:changed', handleItemChanged)
  })

  return item as Ref<V2DatasetItemPayload | null>
}
