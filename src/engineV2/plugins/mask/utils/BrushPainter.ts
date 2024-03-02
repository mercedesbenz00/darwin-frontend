import { v4 as uuidv4 } from 'uuid'

import { euclideanDistance } from '@/engineCommon/algebra'
import { IPoint } from '@/engineCommon/point'
import { MaskAnnotation, Raster, Annotation } from '@/engineV2/models'
import { Range } from '@/engineV2/models/layers/types'
import { TipShape } from '@/engineV2/plugins/pixelBrush/consts'
import { View } from '@/engineV2/views'
import { polygonToRaster } from '@/utils'

import {
  getOrCreateRasterForView,
  getAnnotationForClassIdOnRaster,
  checkAndRemoveEmptyMasks,
  createMaskAnnotation
} from './shared'

type StrokeData = {
  imagePoint: IPoint,
  radius: number
}

type DrawMethod = (
  imagePoint: IPoint,
  radius: number,
  x: number,
  y: number
) => void

type InterpolateGetter = (
  currentStrokeData: StrokeData,
  previousStrokeData: StrokeData,
) => IPoint[]

type BrushRangeMethod = (
  strokeData: StrokeData
) => Range

/**
 * Class which facilitates the drawing of a single brush stroke
 * of a particular label to the raster layer.
 */
export class BrushPainter {
  private readonly view: View
  private readonly raster: Raster
  private readonly classId: number
  private readonly labelIndex: number
  private readonly isEraser: boolean
  private readonly maskAnnotation: MaskAnnotation
  private readonly labelsBeingOverwritten: Set<number> = new Set()
  private editRange: Range
  /**
   * The method used to paint pixels to the raster layer.
   * Varies based on brush type and whether the brush is being
   * used a brush or an eraser.
   */
  private readonly drawMethod: DrawMethod
  /**
   * The method used to get the range of the brushing region.
   *
   * Varies based on `tipShape`.
   */
  private readonly brushRangeMethod: BrushRangeMethod
  /**
   * The method which returns a polygon that needs to be interpolated
   * between individual .stroke() calls.
   *
   * Varies based on the `tipShape`.
   */
  private readonly interpolateGetter: InterpolateGetter
  // We use 2 as the cuttoff rather than 1,
  // as a distance of 1 from the last voxel means any
  // interpolation would be sub grid and not change the raster.
  private readonly minPixelDistanceToInterpolate: number = 2.0
  /**
   * Will be set true in the constructor if a Mask annotation associated
   * with the given classId does not exist. This is then queried to decide
   * whether to create or update the mask annotation at the end of the brush
   * stroke (i.e. .endStroke()).
   */
  private isNewMaskAnnotation: boolean = false
  private previousStrokeData?: StrokeData

  /**
   * Initialises the brush so that the brush stroke logic is efficient.
   *
   * @param view The view on which to paint the brush stroke.
   * @param classId The id of the class to be painted to the raster layer.
   * @param tipShape The shape of the brush tip being used for the stroke.
   * @param isEraser Whether the brush is an eraser rather than an additive paint brush.
   */
  constructor (view: View, classId: number, tipShape: TipShape, isEraser: boolean) {
    this.view = view
    this.raster = getOrCreateRasterForView(view)
    this.classId = classId
    this.maskAnnotation = this.getAnnotationForMaskClass()
    this.isEraser = isEraser

    this.editRange = this.initEditRange()
    const labelIndex = this.raster.getLabelIndexForAnnotationId(this.maskAnnotation.id)

    if (labelIndex === undefined) {
      throw new Error(`Annotation with id ${this.maskAnnotation.id} not on raster`)
    }

    this.labelIndex = labelIndex

    if (isEraser) {
      // Set that this label is beind modified, so that we may check it at the end
      // as a deletion candidate.
      this.labelsBeingOverwritten.add(labelIndex)
    }

    this.drawMethod = this.generateDrawMethod(labelIndex, tipShape, isEraser)
    this.brushRangeMethod = tipShape === TipShape.Round
      ? this.getBrushRange
      : this.getSquareBrushRange
    this.interpolateGetter = tipShape === TipShape.Round
      ? this.getInterpolatedRegionBetweenCircles
      : this.getInterpolatedRegionBetweenSquares
  }

  /**
   * The first time this is called, it paints the brush onto the raster layer
   * using the brushTip.
   *
   * On subsequent calls, this method produces a linearly interpolated brush
   * stroke from the previous stroke location to the current one.
   *
   * @param imagePoint The center of the stroke point in image space.
   * @param radius The radius of the brush stroke.
   */
  public stroke (
    imagePoint: IPoint,
    radius: number,
  ): void {
    const { raster } = this
    const range = this.brushRangeMethod({imagePoint, radius})
    const { minX, minY, maxX, maxY } = range

    // Draw the brush stroke
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.drawMethod(imagePoint, radius, x, y)
      }
    }

    // Potentially draw an interpolated region between brush strokes
    this.interpolateStrokes(range, { imagePoint, radius })

    // Update annotation range
    this.updateRange(this.editRange, range)

    // Invalidate the raster
    raster.invalidate(
      range.minX,
      range.maxX,
      range.minY,
      range.maxY
    )

    // Cache the input as previous stroke data, so we can interpolate
    // on the next stroke event.
    this.previousStrokeData = {
      imagePoint,
      radius
    }
  }

  /**
   * Releases the brush from painting on the raster layer and finishes the stroke.
   * If this was a new mask annotation, this annotation is created, otherwise it is
   * updated.
   */
  public async endStroke (): Promise<void> {
    const { maskAnnotation, view, raster, editRange } = this

    // Get the new bounding box
    const bounding_box = {
      x: editRange.minX,
      y: editRange.minY,
      w: editRange.maxX - editRange.minX + 1,
      h: editRange.maxY - editRange.minY + 1
    }

    if (this.isNewMaskAnnotation && this.isEraser) {
      // Mask annotation doesn't exist, and used the eraser this paint, just clean up.
      raster.clearInProgressAnnotations()
      raster.deleteAnnotationMapping(this.labelIndex)
    } else if (this.isNewMaskAnnotation) {
      // Mask annotation doesn't yet exist, and used a brush, create annotation and clean up.
      await createMaskAnnotation(view, raster, bounding_box, this.labelIndex)
      raster.clearInProgressAnnotations()
    } else {
      // Update annotation
      view.annotationManager.updateAnnotationData(maskAnnotation, {
        bounding_box,
        rasterId: maskAnnotation.data.rasterId
      })

      view.annotationManager.updateAnnotation(maskAnnotation)
    }

    // Potentially remove old annotations
    const labelsBeingOverwrittenArray = Array.from(this.labelsBeingOverwritten)

    checkAndRemoveEmptyMasks(view, raster, labelsBeingOverwrittenArray)
  }

  /**
   * Creates a linearly interpolated stroke between two points
   * on the raster.
   * @param currentInvalidationRange The current invalidated region, should this need be updated.
   * @param currentStrokeData Data on the current stroke point.
   */
  private interpolateStrokes (
    currentInvalidationRange: Range,
    currentStrokeData: StrokeData
  ): void {
    const previousStrokeData = this.previousStrokeData

    if (!previousStrokeData) {
      return
    }

    // Filter out sub-pixel moves
    const prevImagePoint = previousStrokeData.imagePoint
    const currentImagePoint = currentStrokeData.imagePoint

    if (
      Math.abs(prevImagePoint.x - currentImagePoint.x) < this.minPixelDistanceToInterpolate
      && Math.abs(prevImagePoint.y - currentImagePoint.y) < this.minPixelDistanceToInterpolate
    ) {
      return
    }

    const { raster, labelIndex, labelsBeingOverwritten } = this
    const polygon = this.interpolateGetter(currentStrokeData, previousStrokeData)

    const mask: Uint8Array = raster.buffer
    const rasterizedPolygon = polygonToRaster(polygon, raster.width)

    if (this.isEraser) {
    // Erase labels in the polygon defined by this quad
      rasterizedPolygon.data.forEach((index: number): void => {
        if (mask[index] === labelIndex) {
          mask[index] = 0
        }
      })
    } else {
    // Fill in the polygon defined by this quad
      rasterizedPolygon.data.forEach((index: number): void => {
        if (mask[index] !== labelIndex && mask[index] !== 0) {
          labelsBeingOverwritten.add(mask[index])
        }
        mask[index] = labelIndex
      })
    }

    this.updateRange(currentInvalidationRange, rasterizedPolygon.coords)
  }

  /**
   * Given two circle brush points, works out the interpolated quad polygon to rasterize.
   *
   * @param currentStrokeData The current circle brush point.
   * @param previousStrokeData The previous circle brush point.
   */
  private getInterpolatedRegionBetweenCircles (
    currentStrokeData: StrokeData,
    previousStrokeData: StrokeData
  ): IPoint[] {
    // Note: The quad linking the radii connects the two circles perfectly,
    // and no further logic is required, unlike the square brush.

    return this.getQuadLinkingRadii(
      currentStrokeData,
      previousStrokeData
    )
  }

  /**
   * Given two square brush points, works out the interpolated quad polygon to rasterize.
   *
   * @param currentStrokeData The current square brush point.
   * @param previousStrokeData The previous square brush point.
   */
  private getInterpolatedRegionBetweenSquares (
    currentStrokeData: StrokeData,
    previousStrokeData: StrokeData
  ): IPoint[] {
    const quadLinkingRadii = this.getQuadLinkingRadii(currentStrokeData, previousStrokeData)

    // Snap each vertex to the corner of the square brush.
    // This ensures we get a smooth interpolation.

    const prevSquareBrushCorners = this.getSquareBrushCorners(previousStrokeData)
    const currentSquareBrushCorners = this.getSquareBrushCorners(currentStrokeData)

    // First two points to be snapped to the previous square
    quadLinkingRadii[0] = this.snapPointToPolygon(quadLinkingRadii[0], prevSquareBrushCorners)
    quadLinkingRadii[1] = this.snapPointToPolygon(quadLinkingRadii[1], prevSquareBrushCorners)
    // Second two points to be snapped to the current square
    quadLinkingRadii[2] = this.snapPointToPolygon(quadLinkingRadii[2], currentSquareBrushCorners)
    quadLinkingRadii[3] = this.snapPointToPolygon(quadLinkingRadii[3], currentSquareBrushCorners)

    return quadLinkingRadii
  }

  /**
   * Snapes the given `point` to the closest point on the `polygon`.
   * @param point The point to snap
   * @param polygon The target polygon.
   *
   * @returns The snapped point.
   */
  private snapPointToPolygon (point: IPoint, polygon: IPoint[]): IPoint {
    const closest = {
      dist: Infinity,
      index: 0
    }

    for (let i = 0; i < polygon.length; i++) {
      const polygonPoint = polygon[i]
      const dist = euclideanDistance(point, polygonPoint)

      if (dist < closest.dist) {
        closest.dist = dist
        closest.index = i
      }
    }

    return polygon[closest.index]
  }

  /**
   * Gets the four corners of a square brush tip from its `StrokeData`
   * (i.e. its center and radius).
   *
   * @param strokeData The brushTip's center and radius.
   * @returns The 4 corners as a polygon.
   */
  private getSquareBrushCorners (strokeData: StrokeData): IPoint[] {
    const { imagePoint, radius } = strokeData
    const squareRadius = radius / Math.sqrt(2)

    const square = [
      // Bottom Left
      {
        x: imagePoint.x - squareRadius,
        y: imagePoint.y - squareRadius,
      },
      // Bottom Right
      {
        x: imagePoint.x + squareRadius,
        y: imagePoint.y - squareRadius,
      },
      // Top Right
      {
        x: imagePoint.x + squareRadius,
        y: imagePoint.y + squareRadius,
      },
      // Top Left
      {
        x: imagePoint.x - squareRadius,
        y: imagePoint.y + squareRadius,
      }
    ]

    return square
  }

  /**
   * Produces a quadrilateral by taking the vector between the center of two
   * brush points, and at each end, taking two points of length equal to the
   * brush radius perpendicular to this vector.
   *
   * This quadrilateral is used for interpolation.
   *
   * @param currentStrokeData The current square brush point.
   * @param previousStrokeData The previous square brush point.
   * @returns The quad as a polygon.
   */
  private getQuadLinkingRadii (
    currentStrokeData: StrokeData,
    previousStrokeData: StrokeData
  ): IPoint[] {
    const {
      imagePoint: prevImagePoint,
      radius: prevRadius
    } = previousStrokeData
    const {
      imagePoint: currentImagePoint,
      radius: currentRadius
    } = currentStrokeData

    const dist = euclideanDistance(prevImagePoint, currentImagePoint)

    const directionVector = {
      x: (currentImagePoint.x - prevImagePoint.x) / dist,
      y: (currentImagePoint.y - prevImagePoint.y) / dist
    }

    const perpendicularVector1 = {
      x: -directionVector.y,
      y: directionVector.x
    }

    const perpendicularVector2 = {
      x: directionVector.y,
      y: -directionVector.x
    }

    const polygon = [
      // Points on previous Circle
      // prev 1
      {
        x: prevImagePoint.x + perpendicularVector1.x * prevRadius,
        y: prevImagePoint.y + perpendicularVector1.y * prevRadius,
      },
      // prev 2
      {
        x: prevImagePoint.x + perpendicularVector2.x * prevRadius,
        y: prevImagePoint.y + perpendicularVector2.y * prevRadius,
      },
      // Points on current Circle
      // current 2
      {
        x: currentImagePoint.x + perpendicularVector2.x * currentRadius,
        y: currentImagePoint.y + perpendicularVector2.y * currentRadius,
      },
      // current 1
      {
        x: currentImagePoint.x + perpendicularVector1.x * currentRadius,
        y: currentImagePoint.y + perpendicularVector1.y * currentRadius,
      },
    ]

    return polygon
  }

  /**
   * Initialises the range of the edited mask region. This is recalculated as we draw
   * so that we end up with a bounding box for the mask at the end of the stroke.
   *
   * @returns The initial range of the annotation, if present, or a default range
   * if the annotation is new.
   */
  private initEditRange (): Range {
    const { maskAnnotation } = this
    // Create new cache for range of brush updates
    // Using this brush stroke and also the annotations existing range

    const maskAnnotationBoundingBox = maskAnnotation.data.bounding_box

    if (maskAnnotationBoundingBox === undefined) {
      // New annotation, set so that first .stroke() call will set the edit range.
      return {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      }
    }

    const { x, y, w, h } = maskAnnotationBoundingBox

    return {
      minX: x,
      maxX: x + w,
      minY: y,
      maxY: y + h
    }
  }

  /**
   * Gets the range of an individual square brush tip.
   *
   * @param strokeData The square brush point.
   * @returns The range to paint over.
   */
  private getSquareBrushRange (strokeData: StrokeData): Range {
    const { imagePoint, radius } = strokeData
    const squareRadius = radius / Math.sqrt(2)

    return this.getBrushRange({imagePoint, radius: squareRadius})
  }

  /**
   * Gets the range of an individual circular brush tip.
   *
   * @param strokeData The brush point.
   * @returns The range to paint over.
   */
  private getBrushRange (strokeData: StrokeData): Range {
    const { imagePoint, radius } = strokeData

    const minX = Math.floor(imagePoint.x - radius)
    const minY = Math.floor(imagePoint.y - radius)
    const maxX = Math.ceil(imagePoint.x + radius)
    const maxY = Math.ceil(imagePoint.y + radius)

    return { minX, minY, maxX, maxY}
  }

  /**
   * Updates the edit range to bound itself and the rangeToInclude
   *
   * @param rangeToUpdate The range to update with the new range object.
   * @param rangeToInclude The range to include.
   */
  private updateRange (
    rangeToUpdate: Range,
    rangeToInclude: Range
  ): void {
    const { minX, maxX, minY, maxY } = rangeToInclude

    // Update cached item
    if (minX < rangeToUpdate.minX ) {
      rangeToUpdate.minX = minX
    }

    if (maxX > rangeToUpdate.maxX ) {
      rangeToUpdate.maxX = maxX
    }

    if (minY < rangeToUpdate.minY ) {
      rangeToUpdate.minY = minY
    }

    if (maxY > rangeToUpdate.maxY ) {
      rangeToUpdate.maxY = maxY
    }
  }

  /**
   * If a Mask annotation already exists for this stroke's classId, fetches it.
   * If a Mask annotation does not yet exist, creates a temporary one to use whilst
   * we perform the brush stroke prior to annotation creation.
   *
   * @returns The (temporary) Mask annotation.
   */
  private getAnnotationForMaskClass (): MaskAnnotation {
    const { view, raster, classId } = this

    const annotation = getAnnotationForClassIdOnRaster(view, raster, classId)

    if (annotation && annotation.isRasterAnnotation()) {
      return annotation
    }

    // Create a temporary annotation and add it to the raster

    this.isNewMaskAnnotation = true

    const tempAnnotation = Annotation.createFromInstanceParams(this.view, {
      id: uuidv4(),
      actors: [],
      type: 'mask',
      classId: classId,
      data: {
        rasterId: raster.id,
      },
      zIndex: 0
    })

    if (!tempAnnotation || !tempAnnotation.isRasterAnnotation()) {
      throw new Error ('Failed to create temporary annotation')
    }

    raster.setInProgressAnnotation(tempAnnotation)

    // Assign label index
    const labelIndex = this.raster.getNextAvailableLabelIndex()
    this.raster.setAnnotationMapping(labelIndex, tempAnnotation.id)

    return tempAnnotation
  }

  /**
   * Generates a draw method for the brush tip based on the given
   * label index, tip shape and whether the brush stroke is an eraser.
   * @param labelIndex The index being labelled on the raster.
   * @param tipShape The shape of the brush tip.
   * @param isEraser Whether this stroke is an eraser stroke.
   *
   * @returns The draw method to use.
   */
  private generateDrawMethod (
    labelIndex: number,
    tipShape: TipShape,
    isEraser: boolean
  ): DrawMethod {
    if (tipShape === TipShape.Round) {
      if (isEraser) {
        return this.generateCircleEraserDrawMethod(labelIndex)
      } else {
        return this.generateCircleBrushDrawMethod(labelIndex)
      }
    } else {
      if (isEraser) {
        return this.generateSquareEraserDrawMethod(labelIndex)
      } else {
        return this.generateSquareBrushDrawMethod(labelIndex)
      }
    }
  }

  private generateCircleBrushDrawMethod (labelIndex: number): DrawMethod {
    const { raster, labelsBeingOverwritten } = this
    const width = raster.width
    const mask = raster.buffer

    return (imagePoint: IPoint, radius: number, x: number, y: number): void => {
      // Translate to middle of voxel
      const pixelCenterX = x + 0.5
      const pixelCenterY = y + 0.5

      // Note: we don't need to take absolute values as we immediately square these.
      const xDiff = pixelCenterX - imagePoint.x
      const yDiff = pixelCenterY - imagePoint.y

      if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < radius) {
        const pixelIndex = y * width + x
        if (mask[pixelIndex] !== labelIndex && mask[pixelIndex] !== 0) {
          labelsBeingOverwritten.add(mask[pixelIndex])
        }

        mask[pixelIndex] = labelIndex
      }
    }
  }

  private generateCircleEraserDrawMethod (labelIndex: number): DrawMethod {
    const { raster } = this
    const width = raster.width
    const mask = raster.buffer

    return (imagePoint: IPoint, radius: number, x: number, y: number): void => {
      // Translate to middle of voxel
      const pixelCenterX = x + 0.5
      const pixelCenterY = y + 0.5

      // Note: we don't need to take absolute values as we immediately square these.
      const xDiff = pixelCenterX - imagePoint.x
      const yDiff = pixelCenterY - imagePoint.y

      if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) < radius) {
        const pixelIndex = y * width + x

        if (mask[pixelIndex] === labelIndex) {
          mask[pixelIndex] = 0
        }
      }
    }
  }

  private generateSquareBrushDrawMethod (labelIndex: number): DrawMethod {
    const { raster, labelsBeingOverwritten } = this
    const width = raster.width
    const mask = raster.buffer

    return (_: IPoint, __: number, x: number, y: number): void => {
      const pixelIndex = y * width + x

      if (mask[pixelIndex] !== labelIndex && mask[pixelIndex] !== 0) {
        labelsBeingOverwritten.add(mask[pixelIndex])
      }

      mask[pixelIndex] = labelIndex
    }
  }

  private generateSquareEraserDrawMethod (labelIndex: number ): DrawMethod {
    const { raster } = this
    const width = raster.width
    const mask = raster.buffer

    return (_: IPoint, __: number, x: number, y: number): void => {
      const pixelIndex = y * width + x

      if (mask[pixelIndex] === labelIndex) {
        mask[pixelIndex] = 0
      }
    }
  }
}
