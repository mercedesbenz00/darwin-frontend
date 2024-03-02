import { Vue, Component, Prop } from 'vue-property-decorator'

import { EditorCursor } from '@/engine/EditorCursor'
import { Editor } from '@/engine/editor'

/**
 * Preloads all editor cursor svgs

 * The reason why we are doing this is because if we switch between icons
 * which has not been loaded yet, the cursor disappears before you move your mouse.
 * To overcome this kind of UI issue, preloads the all the icons' svg files ahead.
 */
@Component({ name: 'cursor-loader' })
export default class CursorLoader extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  availableCursors: EditorCursor[] = [
    EditorCursor.Default,
    EditorCursor.Draw,
    EditorCursor.AddPoint,
    EditorCursor.RemovePoint,
    EditorCursor.Edit,
    EditorCursor.Ellipse,
    EditorCursor.Edit,
    EditorCursor.Move,
    EditorCursor.Moving,
    EditorCursor.Magic,
    EditorCursor.MagicAddPoint,
    EditorCursor.MagicRemovePoint,
    EditorCursor.MagicDeleteClick,
    EditorCursor.BBox,
    EditorCursor.Commentator,
    EditorCursor.ZoomIn,
    EditorCursor.ZoomOut
  ]

  mounted () {
    for (const cursor of this.availableCursors) {
      this.editor.selectCursor(cursor)
    }
    this.editor.selectCursor(EditorCursor.Default)
  }

  render () {
    return null
  }
}
