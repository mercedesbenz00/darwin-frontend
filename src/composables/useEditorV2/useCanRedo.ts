import { ref, Ref, onBeforeUnmount } from 'vue'

import { useEditorV2 } from '@/composables/useEditorV2'

export const useCanRedo = (): Ref<boolean> => {
  const { resolveEditor } = useEditorV2()

  const editor = resolveEditor()
  if (!editor?.value) { throw new Error('Editor is not set!') }

  const canRedo = ref(editor.value.actionManager.canRedo)

  const handle = (): void => {
    canRedo.value = editor.value.actionManager.canRedo
  }
  editor.value.actionManager.on('undoneActions:changed', handle)

  onBeforeUnmount(() => {
    editor.value.actionManager.off('undoneActions:changed', handle)
  })

  return canRedo as Ref<boolean>
}
