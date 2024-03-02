import { ref, Ref, onBeforeUnmount } from 'vue'

import { useEditorV2 } from '@/composables/useEditorV2'
import { Layout } from '@/engineV2/layout'

export const useEditorLayout = (): Ref<Layout> => {
  const { resolveEditor } = useEditorV2()

  const editor = resolveEditor()
  if (!editor?.value) { throw new Error('Editor is not set!') }

  const layout = ref(editor.value.layout)

  const handleLayoutChanged = (newLayout: Layout): void => {
    layout.value = newLayout
  }
  editor.value.on('layout:changed', handleLayoutChanged)

  onBeforeUnmount(() => {
    editor.value.off('layout:changed', handleLayoutChanged)
  })

  return layout as Ref<Layout>
}
