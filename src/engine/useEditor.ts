import { ref, provide, inject, Ref } from 'vue'

import { useStore } from '@/composables'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

export const useEditor = (): {
  initEditor: () => void
  resolveEditor: () => Ref<Editor> | undefined
} => {
  const store = useStore()

  const initEditor = (): void => {
    const editor = ref(new Editor(new ItemManager(store), store))
    provide('editor', editor)
  }

  const resolveEditor = (): Ref<Editor> | undefined =>
    inject<Ref<Editor>>('editor')

  return { initEditor, resolveEditor }
}
