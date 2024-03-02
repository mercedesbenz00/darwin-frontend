import { cloneDeep } from 'lodash'

import { Editor } from '@/engine/editor'
import { isMainAnnotationTypeRenderer } from '@/engine/managers'
import { resolveModifierByPriority } from '@/engine/utils'
import { EditableImagePoint, ImagePoint, pointIsVertexOfPath } from '@/engineCommon/point'
import { CanvasEvent } from '@/utils/touch'

export const translateVertex = (
  editor: Editor,
  vertex: EditableImagePoint,
  offset: ImagePoint,
  tool: { vertexMoving?: EditableImagePoint },
  event: CanvasEvent
) => {
  const { activeView } = editor

  const selectedAnnotation = editor.selectedAnnotation
  if (!selectedAnnotation) { return }

  const renderer = activeView.renderManager.rendererFor(selectedAnnotation.type)
  if (!isMainAnnotationTypeRenderer(renderer)) { return }
  // if video annotation, create an annotation keyframe
  // Otherwise just translate the annotation

  if (!selectedAnnotation.isVideoAnnotation()) {
    const path = renderer.getAllVertices(selectedAnnotation, activeView)
    if (path && pointIsVertexOfPath(vertex, path, 5 / editor.cameraScale)) {
      const specialKey = resolveModifierByPriority(event)
      return renderer.moveVertex(selectedAnnotation, vertex, offset, activeView, specialKey)
    }
    return
  }

  const { loadedVideo } = activeView
  if (!loadedVideo) { return }

  const inferredData = selectedAnnotation.inferVideoData(activeView)
  const { keyframe, subs } = inferredData
  let { data: annotationData } = inferredData

  if (!annotationData) { return }
  // If it's not yet a key frame, make it a key frame
  // Then we need to relocate the vertex since cloneDeep breaks the old link.
  if (!keyframe) {
    annotationData = cloneDeep(annotationData)
    activeView.updateAnnotationFrame(
      selectedAnnotation,
      annotationData,
      subs,
      activeView.currentFrameIndex
    )
    tool.vertexMoving = editor.findAnnotationVertexAt(vertex)
    if (tool.vertexMoving) {
      vertex = tool.vertexMoving
    }
  }

  // Build an Annotation object with current frame data, then translate it
  const currentAnnotation = selectedAnnotation.shallowClone({ data: annotationData })
  const path = renderer.getAllVertices(currentAnnotation, activeView)
  if (path && pointIsVertexOfPath(vertex, path, 5 / editor.cameraScale)) {
    const specialKey = resolveModifierByPriority(event)
    renderer.moveVertex(currentAnnotation, vertex, offset, activeView, specialKey)
    activeView.updateAnnotationFrame(
      selectedAnnotation,
      currentAnnotation.data,
      subs,
      activeView.currentFrameIndex
    )
  }
}
