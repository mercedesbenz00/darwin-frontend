import { ref, provide, inject, Ref } from 'vue'

import { useStore } from '@/composables'
import { Editor } from '@/engineV2/editor'
import { LayoutConfig } from '@/engineV2/layout'
import { CommentsProvider } from '@/providers/CommentsProvider'
import { isFeatureEnabled } from '@/store/helper'

export const useEditorV2 = (): {
  initEditor: (layout: LayoutConfig) => void
  resolveEditor: () => Ref<Editor> | undefined
} => {
  const store = useStore()

  const featureFlags = {
    LAYER_V2: isFeatureEnabled('LAYER_V2'),
    RASTERS: isFeatureEnabled('RASTERS')
  }

  const initEditor = (layout: LayoutConfig): Ref<Editor> => {
    const editorV2 = ref(new Editor(store, layout, {
      flags: featureFlags,
      providers: {
        commentsProvider: new CommentsProvider()
      }
    }))
    provide('editorV2', editorV2)
    // typescript doesn't infer line 14 as Ref<Editor> so we must cast here
    return editorV2 as Ref<Editor>
  }

  const resolveEditor = (): Ref<Editor> | undefined => inject<Ref<Editor>>('editorV2')

  return { initEditor, resolveEditor }
}
