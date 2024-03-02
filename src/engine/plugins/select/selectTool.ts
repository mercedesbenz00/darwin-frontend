import { EditorCursor } from '@/engine/EditorCursor'
import { Tool, ToolContext } from '@/engine/managers'
import {
  setupPrimaryButtonPanning,
  setupWheelPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { ImagePoint, Point } from '@/engineCommon/point'
interface SelectTool extends Tool {
  initialPoint?: ImagePoint,
  initialPosition?: ImagePoint
}

const selectTool: SelectTool = {
  initialPoint: undefined,
  activate (context: ToolContext) {
    context.editor.selectCursor(EditorCursor.Default)
    context.handles.push(...context.editor.onMouseDown(event => {
      const mouse = context.editor.camera.canvasViewToImageView(
        new Point({ x: event.offsetX, y: event.offsetY })
      )
      const annotation = context.editor.findTopAnnotationAt(mouse)

      if (annotation) {
        // If an annotation was clicked at, we will start moving it.
        annotation.select()
        this.initialPosition = context.editor.camera.canvasViewToImageView(
          new Point({ x: event.offsetX, y: event.offsetY })
        )
        this.initialPoint = context.editor.camera.canvasViewToImageView(
          new Point({ x: event.offsetX, y: event.offsetY })
        )
      } else {
        context.editor.deselectAllAnnotations()
        context.editor.deselectAllVertices()
      }
      context.editor.activeView.annotationsLayer.changed()
    }))

    setupWheelPanning(context)
    setupPrimaryButtonPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)
  },
  deactivate () { },
  reset () { }
}

export default selectTool
