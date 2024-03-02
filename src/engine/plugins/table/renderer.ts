import { drawPath, drawText } from '@/engine/graphics'
import { Annotation, CompoundPath, MainAnnotationTypeRenderer, View } from '@/engine/models'
import { String } from '@/engine/plugins/field/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'

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
    view: View,
    annotation: Annotation,
    inferred: boolean,
    filter: ImageManipulationFilter
  ): void {
    const { inferenceData, mainAnnotations } = view
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

      drawPath(
        view,
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
        color,
        inferred,
        filter
      )

      for (const source of stringData.sources) {
        const sourceAnnotation = annotations.find(a => a.id === source.id)
        if (!sourceAnnotation) { continue }

        if (!sourceAnnotation.boundingBox || !sourceAnnotation.text) {
          continue
        }

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
    }

    annotation.initializeCachedAttributes()
    if (annotation.boundingBox) {
      annotation.path2D = drawPath(
        view,
        {
          path: [
            annotation.boundingBox.topLeft,
            annotation.boundingBox.topRight,
            annotation.boundingBox.bottomRight,
            annotation.boundingBox.bottomLeft
          ],
          additionalPaths: []
        },
        { ...color, a: 0.2 },
        inferred,
        filter,
        annotation.isHighlighted,
        annotation.isSelected
      )

      drawText(
        view,
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

  getPath (annotation: Annotation): CompoundPath {
    return { path: getPath(annotation), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation): EditableImagePoint[] {
    return getPath(annotation)
  }

  translate (): null { return null }

  moveVertex (): null { return null }
}
