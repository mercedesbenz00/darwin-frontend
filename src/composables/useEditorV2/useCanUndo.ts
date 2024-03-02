import { ref, Ref, onBeforeUnmount } from 'vue'

import { useEditorV2 } from '@/composables/useEditorV2'

export const useCanUndo = (): Ref<boolean> => {
  const { resolveEditor } = useEditorV2()

  const editor = resolveEditor()
  if (!editor?.value) { throw new Error('Editor is not set!') }

  const canUndo = ref(editor.value.actionManager.canUndo)

  const handle = (): void => {
    canUndo.value = editor.value.actionManager.canUndo
  }
  editor.value.actionManager.on('doneActions:changed', handle)

  onBeforeUnmount(() => {
    editor.value.actionManager.off('doneActions:changed', handle)
  })

  return canUndo as Ref<boolean>
}
