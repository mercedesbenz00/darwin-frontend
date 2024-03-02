import { ImagePoint, Point } from '@/engineCommon/point'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Tool, ToolContext } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'

interface SelectTool extends Tool {
  initialPoint?: ImagePoint,
  initialPosition?: ImagePoint
}

const selectTool: SelectTool = {
  initialPoint: undefined,
  activate (context: ToolContext) {
    setupPrimaryButtonPanning(context)
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)
    context.editor.selectCursor(EditorCursor.Default)
    context.handles.push(...context.editor.onMouseDown(event => {
      const mouse = context.editor.activeView.camera.canvasViewToImageView(
        new Point({ x: event.offsetX, y: event.offsetY })
      )
      const annotation = context.editor.activeView.annotationManager.findTopAnnotationAt(mouse)

      if (annotation) {
        // If an annotation was clicked at, we will start moving it.
        context.editor
          .activeView
          .annotationManager
          .selectAnnotation(annotation.id)
        this.initialPosition = context.editor.activeView.camera.canvasViewToImageView(
          new Point({ x: event.offsetX, y: event.offsetY })
        )
        this.initialPoint = context.editor.activeView.camera.canvasViewToImageView(
          new Point({ x: event.offsetX, y: event.offsetY })
        )
      } else {
        context.editor.activeView.annotationManager.deselectAllAnnotations()
        context.editor.activeView.deselectAllVertices()
      }
      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
    }))
  },
  deactivate () { },
  reset () { }
}

export default selectTool
