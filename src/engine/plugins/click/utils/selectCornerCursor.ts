import { EditorCursor } from '@/engine/EditorCursor'
import { Editor } from '@/engine/editor'
import { CornerPosition } from '@/engine/plugins/click/types'

export const selectCornerCursor = (editor: Editor, corner: CornerPosition): void => {
  if (corner === 'top-left') {
    editor.selectCursor(EditorCursor.NWResize)
  } else if (corner === 'top-right') {
    editor.selectCursor(EditorCursor.NEResize)
  } else if (corner === 'bottom-right') {
    editor.selectCursor(EditorCursor.SEResize)
  } else if (corner === 'bottom-left') {
    editor.selectCursor(EditorCursor.SWResize)
  }
}
