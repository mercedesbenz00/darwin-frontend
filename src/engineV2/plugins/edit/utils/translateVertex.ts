import { cloneDeep } from 'lodash'

import { EditableImagePoint, ImagePoint, pointIsVertexOfPath } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { isMainAnnotationTypeRenderer } from '@/engineV2/managers'
import { resolveModifierByPriority } from '@/engineV2/utils'
import { CanvasEvent } from '@/utils/touch'

export const translateVertex = (
  editor: Editor,
  vertex: EditableImagePoint,
  offset: ImagePoint,
  tool: { vertexMoving?: EditableImagePoint },
  event: CanvasEvent
) => {
  const { activeView } = editor

  const selectedAnnotation = editor.activeView.annotationManager.selectedAnnotation
  if (!selectedAnnotation) { return }

  const renderer = activeView.renderManager.rendererFor(selectedAnnotation.type)
  if (!isMainAnnotationTypeRenderer(renderer)) { return }
  // if video annotation, create an annotation keyframe
  // Otherwise just translate the annotation

  if (!selectedAnnotation.isVideoAnnotation()) {
    const path = renderer.getAllVertices(selectedAnnotation, activeView)
    if (path && pointIsVertexOfPath(vertex, path, 5 / editor.activeView.cameraScale)) {
      const specialKey = resolveModifierByPriority(event)
      return renderer.moveVertex(selectedAnnotation, vertex, offset, activeView, specialKey)
    }
    return
  }

  const { isLoading } = activeView
  if (isLoading) { return }

  const inferredData = selectedAnnotation.inferVideoData(activeView)
  const { keyframe, subs } = inferredData
  let { data: annotationData } = inferredData

  if (!annotationData) { return }
  // If it's not yet a key frame, make it a key frame
  // Then we need to relocate the vertex since cloneDeep breaks the old link.
  if (!keyframe) {
    annotationData = cloneDeep(annotationData)
    activeView.annotationManager.updateAnnotationFrame(
      selectedAnnotation,
      annotationData,
      subs,
      activeView.currentFrameIndex
    )
    tool.vertexMoving = editor.activeView.annotationManager.findAnnotationVertexAt(vertex)
    if (tool.vertexMoving) {
      vertex = tool.vertexMoving
    }
  }

  // Build an Annotation object with current frame data, then translate it
  const currentAnnotation = selectedAnnotation.shallowClone({ data: annotationData })
  const path = renderer.getAllVertices(currentAnnotation, activeView)
  if (path && pointIsVertexOfPath(vertex, path, 5 / editor.activeView.cameraScale)) {
    const specialKey = resolveModifierByPriority(event)
    renderer.moveVertex(currentAnnotation, vertex, offset, activeView, specialKey)
    activeView.annotationManager.updateAnnotationFrame(
      selectedAnnotation,
      currentAnnotation.data,
      subs,
      activeView.currentFrameIndex
    )
  }
}
