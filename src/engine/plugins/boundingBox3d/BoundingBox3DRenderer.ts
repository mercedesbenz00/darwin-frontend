import { drawCuboid } from '@/engine/graphics'
import {
  View,
  Annotation,
  MainAnnotationTypeRenderer
} from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { BoundingBox } from '@/engine/plugins/boundingBox/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'

import { BoundingBox3D } from './types'

function getBoundingBoxPath (boundingBox: BoundingBox): EditableImagePoint[] {
  return [
    boundingBox.topLeft,
    boundingBox.topRight,
    boundingBox.bottomRight,
    boundingBox.bottomLeft
  ]
}

function getPath (annotation: Annotation): EditableImagePoint[] {
  let cuboid
  // When you select annotation at video item
  // it uses a different data format.
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData()
    cuboid = data
  } else {
    cuboid = annotation.data as BoundingBox3D
  }
  const path = new Set()
  if (cuboid.front.topLeft.y < cuboid.back.topLeft.y) {
    path.add(cuboid.front.topLeft)
    path.add(cuboid.front.topRight)
  } else {
    path.add(cuboid.back.topLeft)
    path.add(cuboid.back.topRight)
  }
  if (cuboid.front.topRight.x > cuboid.back.topRight.x) {
    path.add(cuboid.front.topRight)
    path.add(cuboid.front.bottomRight)
  } else {
    path.add(cuboid.back.topRight)
    path.add(cuboid.back.bottomRight)
  }
  if (cuboid.front.bottomLeft.y > cuboid.back.bottomLeft.y) {
    path.add(cuboid.front.bottomRight)
    path.add(cuboid.front.bottomLeft)
  } else {
    path.add(cuboid.back.bottomRight)
    path.add(cuboid.back.bottomLeft)
  }
  if (cuboid.front.topLeft.x < cuboid.back.topLeft.x) {
    path.add(cuboid.front.bottomLeft)
    path.add(cuboid.front.topLeft)
  } else {
    path.add(cuboid.back.bottomLeft)
    path.add(cuboid.back.topLeft)
  }
  return Array.from(path) as EditableImagePoint[]
}

export class BoundingBox3DRenderer extends MainAnnotationTypeRenderer {
  render (view: View, annotation: Annotation, _: boolean, filter: ImageManipulationFilter | null) {
    const cuboid = annotation.data as BoundingBox3D
    const color = annotation.color
    drawCuboid(
      view,
      getPath(annotation),
      getBoundingBoxPath(cuboid.front),
      getBoundingBoxPath(cuboid.back),
      color,
      filter,
      annotation.isHighlighted,
      annotation.isSelected
    )
  }

  getAllVertices (annotation: Annotation, view: IView): EditableImagePoint[] {
    let cuboid
    // When you select annotation at video item
    // it uses a different data format.
    if (annotation.isVideoAnnotation()) {
      const { data } = annotation.inferVideoData(view)
      cuboid = data
    } else {
      cuboid = annotation.data as BoundingBox3D
    }
    const frontPath = getBoundingBoxPath(cuboid.front)
    const backPath = getBoundingBoxPath(cuboid.back)
    return frontPath.concat(backPath) as EditableImagePoint[]
  }

  getPath (annotation: Annotation) {
    return { path: getPath(annotation), additionalPaths: [] }
  }

  translate (annotation: Annotation, offset: ImagePoint) {
    const cuboid = annotation.data as BoundingBox3D
    cuboid.front.topLeft.add_(offset)
    cuboid.front.topRight.add_(offset)
    cuboid.front.bottomLeft.add_(offset)
    cuboid.front.bottomRight.add_(offset)
    cuboid.back.topLeft.add_(offset)
    cuboid.back.topRight.add_(offset)
    cuboid.back.bottomLeft.add_(offset)
    cuboid.back.bottomRight.add_(offset)
  }

  moveVertex (annotation: Annotation, movingVertex: EditableImagePoint, offset: ImagePoint) {
    const cuboid = annotation.data as BoundingBox3D
    for (const boundingBox of [cuboid.front, cuboid.back]) {
      const path =
        [boundingBox.topLeft, boundingBox.topRight, boundingBox.bottomRight, boundingBox.bottomLeft]
      let index: number | undefined
      for (let i = 0; i < path.length; i++) {
        if (path[i].x === movingVertex.x && path[i].y === movingVertex.y) {
          index = i
          break
        }
      }
      switch (index) {
      // Top Left -> Top Right and Bottom Left move
      case 0: {
        path[0].add_(offset)
        path[1].y += offset.y
        path[3].x += offset.x
        break
      }
      // Top Right -> Top Left and Bottom Right move
      case 1: {
        path[1].add_(offset)
        path[0].y += offset.y
        path[2].x += offset.x
        break
      }
      // Bottom Right -> Top Right and Bottom Left move
      case 2: {
        path[2].add_(offset)
        path[1].x += offset.x
        path[3].y += offset.y
        break
      }
      // Bottom Left -> Top Left and Bottom Right move
      case 3: {
        path[3].add_(offset)
        path[0].x += offset.x
        path[2].y += offset.y
        break
      }
      }
    }
  }
}
