import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'
import { drawPath, drawPathV2, drawText, drawTextV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  Annotation,
  CompoundPath,
  MainAnnotationTypeRenderer,
  View,
  ILayer
} from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { String } from '@/engineV2/plugins/field/types'

import { Table } from './types'

const getPath = (annotation: Annotation): EditableImagePoint[] => {
  const { boundingBox } = annotation
  if (!boundingBox) { return [] }

  return [
    boundingBox.topLeft,
    boundingBox.topRight,
    boundingBox.bottomRight,
    boundingBox.bottomLeft
  ]
}

export class TableRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = false
  readonly enableInterpolateByDefault: boolean = false

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    inferred: boolean,
    filter: ImageManipulationFilter
  ): void {
    const { inferenceData, mainAnnotations } = view.annotationManager
    const annotations = inferred ? inferenceData : mainAnnotations
    if (!annotations) { return }

    let tableData: Table
    if (annotation.isVideoAnnotation()) {
      const { data } = annotation.inferVideoData(view)
      tableData = data as Table
    } else {
      tableData = annotation.data as Table
    }

    const color = annotation.color
    for (const cell of tableData.cells) {
      const cellAnnotation = annotations.find(a => a.id === cell.id)
      if (!cellAnnotation) { continue }

      cellAnnotation.initializeCachedAttributes()

      let stringData: String
      if (cellAnnotation.isVideoAnnotation()) {
        const { data } = cellAnnotation.inferVideoData(view)
        stringData = data as String
      } else {
        stringData = cellAnnotation.data as String
      }

      if (FeatureFlagsManager.isOnLayerV2) {
        drawPathV2(
          drawFn,
          {
            path: [
              new EditablePoint({ x: cell.bounding_box.x, y: cell.bounding_box.y }),
              new EditablePoint({
                x: cell.bounding_box.x + cell.bounding_box.w,
                y: cell.bounding_box.y
              }),
              new EditablePoint({
                x: cell.bounding_box.x + cell.bounding_box.w,
                y: cell.bounding_box.y + cell.bounding_box.h
              }),
              new EditablePoint({
                x: cell.bounding_box.x,
                y: cell.bounding_box.y + cell.bounding_box.h
              })
            ],
            additionalPaths: []
          },
          view.camera,
          color,
          inferred,
          filter
        )
      } else {
        drawPath(
          {
            path: [
              new EditablePoint({ x: cell.bounding_box.x, y: cell.bounding_box.y }),
              new EditablePoint({
                x: cell.bounding_box.x + cell.bounding_box.w,
                y: cell.bounding_box.y
              }),
              new EditablePoint({
                x: cell.bounding_box.x + cell.bounding_box.w,
                y: cell.bounding_box.y + cell.bounding_box.h
              }),
              new EditablePoint({
                x: cell.bounding_box.x,
                y: cell.bounding_box.y + cell.bounding_box.h
              })
            ],
            additionalPaths: []
          },
          layer.context,
          view.camera,
          color,
          inferred,
          filter
        )
      }

      for (const source of stringData.sources) {
        const sourceAnnotation = annotations.find(a => a.id === source.id)
        if (!sourceAnnotation) { continue }

        if (!sourceAnnotation.boundingBox || !sourceAnnotation.text) {
          continue
        }

        if (!annotation.isHighlighted) { continue }

        if (FeatureFlagsManager.isOnLayerV2) {
          drawTextV2(
            drawFn,
            sourceAnnotation.boundingBox.topLeft,
            sourceAnnotation.boundingBox.topRight.x - sourceAnnotation.boundingBox.topLeft.x,
            sourceAnnotation.boundingBox.bottomLeft.y - sourceAnnotation.boundingBox.topLeft.y,
            sourceAnnotation.text,
            { r: 255, g: 255, b: 255, a: 1.0 },
            { r: 0, g: 0, b: 0, a: 0.8 },
            'FiraMono'
          )
        } else {
          drawText(
            view.camera,
            layer.context,
            sourceAnnotation.boundingBox.topLeft,
            sourceAnnotation.boundingBox.topRight.x - sourceAnnotation.boundingBox.topLeft.x,
            sourceAnnotation.boundingBox.bottomLeft.y - sourceAnnotation.boundingBox.topLeft.y,
            sourceAnnotation.text,
            { r: 255, g: 255, b: 255, a: 1.0 },
            { r: 0, g: 0, b: 0, a: 0.8 },
            'FiraMono'
          )
        }
      }
    }

    annotation.initializeCachedAttributes()
    if (annotation.boundingBox) {
      if (FeatureFlagsManager.isOnLayerV2) {
        drawPathV2(
          drawFn,
          {
            path: [
              annotation.boundingBox.topLeft,
              annotation.boundingBox.topRight,
              annotation.boundingBox.bottomRight,
              annotation.boundingBox.bottomLeft
            ],
            additionalPaths: []
          },
          view.camera,
          { ...color, a: 0.2 },
          inferred,
          filter,
          annotation.isHighlighted,
          annotation.isSelected
        )

        drawTextV2(
          drawFn,
          new EditablePoint({
            x: annotation.boundingBox.topLeft.x,
            y: annotation.boundingBox.topLeft.y - 6
          }),
          20,
          6,
          annotation.annotationClass!.name,
          annotation.color,
          { r: 255, g: 255, b: 255, a: 1.0 },
          'Inter',
          4
        )
      } else {
        annotation.path2D = drawPath(
          {
            path: [
              annotation.boundingBox.topLeft,
              annotation.boundingBox.topRight,
              annotation.boundingBox.bottomRight,
              annotation.boundingBox.bottomLeft
            ],
            additionalPaths: []
          },
          layer.context,
          view.camera,
          { ...color, a: 0.2 },
          inferred,
          filter,
          annotation.isHighlighted,
          annotation.isSelected
        )

        drawText(
          view.camera,
          layer.context,
          new EditablePoint({
            x: annotation.boundingBox.topLeft.x,
            y: annotation.boundingBox.topLeft.y - 6
          }),
          20,
          6,
        annotation.annotationClass!.name,
        annotation.color,
        { r: 255, g: 255, b: 255, a: 1.0 },
        'Inter',
        4
        )
      }
    }
  }

  getPath (annotation: Annotation): CompoundPath {
    return { path: getPath(annotation), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation): EditableImagePoint[] {
    return getPath(annotation)
  }

  translate (): null { return null }

  moveVertex (): null { return null }
}
