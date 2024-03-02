import { drawPath, drawSegment, drawText } from '@/engine/graphics'
import { Annotation, CompoundPath, MainAnnotationTypeRenderer, View } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { pointInRect2, rectIntersect2 } from '@/engineCommon/algebra'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'

import { Graph, String } from './types'
import { findCloserPoint, findEdgeNodeAnnotations, findShortestSegment } from './utils'

function getPath (annotation: Annotation): EditableImagePoint[] {
  const { boundingBox } = annotation
  if (!boundingBox) { return [] }

  return [
    boundingBox.topLeft,
    boundingBox.topRight,
    boundingBox.bottomRight,
    boundingBox.bottomLeft
  ]
}

export class GraphRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = false
  readonly enableInterpolateByDefault: boolean = false

  render (
    view: View,
    annotation: Annotation,
    inferred: boolean,
    filter: ImageManipulationFilter
  ): void {
    const { inferenceData, mainAnnotations } = view
    const annotations = inferred ? inferenceData : mainAnnotations
    if (!annotations) { return }

    if (!annotation.boundingBox) {
      annotation.initializeCachedAttributes()
    }

    const graphData: Graph = annotation.isVideoAnnotation()
      ? annotation.inferVideoData(view).data as Graph
      : annotation.data as Graph

    const graphColor = { r: 61, g: 88, b: 143, a: 1.0 }
    const { nodes, edges } = graphData

    for (const node of nodes) {
      const nodeAnnotation = annotations.find(a => a.id === node.id)
      if (!nodeAnnotation) { continue }

      if (nodeAnnotation.boundingBox && nodeAnnotation.text) {
        let stringData: String
        if (nodeAnnotation.isVideoAnnotation()) {
          const { data } = nodeAnnotation.inferVideoData(view)
          stringData = data as String
        } else {
          stringData = nodeAnnotation.data as String
        }

        for (const source of stringData.sources) {
          const sourceAnnotation = annotations.find(a => a.id === source.id)
          if (!sourceAnnotation) { continue }

          if (!sourceAnnotation.boundingBox || !sourceAnnotation.text) { continue }

          if (!annotation.isHighlighted) { continue }

          drawText(
            view,
            sourceAnnotation.boundingBox.topLeft,
            sourceAnnotation.boundingBox.topRight.x - sourceAnnotation.boundingBox.topLeft.x,
            sourceAnnotation.boundingBox.bottomLeft.y - sourceAnnotation.boundingBox.topLeft.y,
            sourceAnnotation.text,
            { r: 255, g: 255, b: 255, a: 1.0 },
            { r: 0, g: 0, b: 0, a: 0.8 },
            'FiraMono'
          )
        }

        const color = !annotation.annotationClass || annotation.annotationClass.name === 'keyvalue'
          ? graphColor
          : annotation.color

        drawPath(
          view,
          {
            path: [
              nodeAnnotation.boundingBox.topLeft,
              nodeAnnotation.boundingBox.topRight,
              nodeAnnotation.boundingBox.bottomRight,
              nodeAnnotation.boundingBox.bottomLeft
            ],
            additionalPaths: []
          },
          color,
          false,
          filter
        )
      } else {
        nodeAnnotation.initializeCachedAttributes()
      }
    }

    for (const edge of edges) {
      const nodeAnnotations = findEdgeNodeAnnotations(edge, nodes, annotations)
      if (!nodeAnnotations) { continue }

      const { startNodeAnnotation, endNodeAnnotation } = nodeAnnotations
      const box1 = startNodeAnnotation.boundingBox
      const box2 = endNodeAnnotation.boundingBox
      if (!box1 || !box2) { continue }

      const p1x = (box1.topRight.x + box1.topLeft.x) / 2
      const p1y = (box1.bottomRight.y + box1.topRight.y) / 2
      const p2x = (box2.topRight.x + box2.topLeft.x) / 2
      const p2y = (box2.bottomRight.y + box2.topRight.y) / 2
      const middlePoints1 = [
        { x: p1x, y: box1.topLeft.y },
        { x: p1x, y: box1.bottomLeft.y },
        { x: box1.topLeft.x, y: p1y },
        { x: box1.topRight.x, y: p1y }
      ]
      const middlePoints2 = [
        { x: p2x, y: box2.topLeft.y },
        { x: p2x, y: box2.bottomLeft.y },
        { x: box2.topLeft.x, y: p2y },
        { x: box2.topRight.x, y: p2y }
      ]

      const k = (p2y - p1y) / (p2x - p1x)
      const m = p1y - k * p1x

      const r1x = Math.abs(p1x - box1.topLeft.x)
      const r1y = Math.abs(p1y - box1.topLeft.y)
      const r2x = Math.abs(p2x - box2.topLeft.x)
      const r2y = Math.abs(p2y - box2.topLeft.y)
      const rect1 = rectIntersect2(p1x, p1y, r1x, r1y, k, m)
      const rect2 = rectIntersect2(p2x, p2y, r2x, r2y, k, m)

      const points1 = rect1.filter(p => pointInRect2(p1x, p1y, r1x, r1y, p))
      const points2 = rect2.filter(p => pointInRect2(p2x, p2y, r2x, r2y, p))

      const { annotationClass } = annotation
      const color = !annotationClass || annotationClass.name === 'keyvalue'
        ? graphColor
        : annotation.color

      const { start, end } = findShortestSegment(points1, points2)
      const startPoint = findCloserPoint(start, middlePoints1)
      const endPoint = findCloserPoint(end, middlePoints2)

      const middleDiagPoint = {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2
      }

      const segments = []
      if (startPoint.x === p1x) {
        segments.push([startPoint, { x: startPoint.x, y: middleDiagPoint.y }])
        segments.push([
          { x: startPoint.x, y: middleDiagPoint.y },
          { x: endPoint.x, y: middleDiagPoint.y }
        ])
        segments.push([
          { x: endPoint.x, y: middleDiagPoint.y },
          { x: endPoint.x, y: endPoint.y }
        ])
      } else {
        segments.push([startPoint, { x: middleDiagPoint.x, y: startPoint.y }])
        segments.push([
          { x: middleDiagPoint.x, y: startPoint.y },
          { x: middleDiagPoint.x, y: endPoint.y }
        ])
        segments.push([
          { x: middleDiagPoint.x, y: endPoint.y },
          { x: endPoint.x, y: endPoint.y }
        ])
      }

      for (const [start, end] of segments) {
        drawSegment(
          view,
          new EditablePoint(start),
          new EditablePoint(end),
          color,
          filter
        )
      }

      if (endNodeAnnotation.boundingBox && annotationClass && annotationClass.name !== 'keyvalue') {
        drawText(
          view,
          new EditablePoint({
            x: endNodeAnnotation.boundingBox.topLeft.x,
            y: endNodeAnnotation.boundingBox.topLeft.y - 6
          }),
          20,
          6,
          annotationClass.name,
          annotation.color,
          { r: 255, g: 255, b: 255, a: 1.0 },
          'Inter',
          4
        )
      }
    }
  }

  getPath (annotation: Annotation, view: IView): CompoundPath {
    const graphData: Graph = annotation.isVideoAnnotation()
      ? annotation.inferVideoData(view).data as Graph
      : annotation.data as Graph

    const paths: EditableImagePoint[][] = []
    for (const node of graphData.nodes) {
      const nodeAnnotation = view.editor.mainAnnotations.find(a => a.id === node.id)
      if (!nodeAnnotation) { continue }

      paths.push(getPath(nodeAnnotation))
    }

    // The default [] avoids an error being thrown if there is no path to render
    // This error throwing would result in the select/edit tools
    // not being able to pan when such an annotation is on the canvas
    // This is not the perfect fix, likely, so should be revisited.
    return { path: paths[0] || [], additionalPaths: paths.slice(1) }
  }

  getAllVertices (annotation: Annotation): EditableImagePoint[] {
    return getPath(annotation)
  }

  translate (): null { return null }

  moveVertex (): null { return null }
}
