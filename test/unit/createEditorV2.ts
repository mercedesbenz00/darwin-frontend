import { createTestStore } from 'test/unit/createTestStore'

import { Editor, EditorConfig } from '@/engineV2/editor'
import { LayoutConfig } from '@/engineV2/layout'
import { CommentsProvider } from '@/providers/CommentsProvider'

export const createEditorV2 = (
  store: ReturnType<typeof createTestStore>,
  layout: Partial<LayoutConfig> = {},
  config: Partial<EditorConfig> = {}
): Editor => {
  return new Editor(
    store,
    {
      type: 'simple',
      views: [],
      ...layout
    },
    {
      providers: {
        commentsProvider: new CommentsProvider()
      },
      ...config
    }
  )
}
