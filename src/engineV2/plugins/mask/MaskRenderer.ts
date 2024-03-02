import { Camera } from '@/engineCommon/camera'
import { defaultAlpha, rasterOutlineAlpha } from '@/engineV2/graphics'
import {
  Annotation,
  Raster,
  RasterTypeRenderer,
  ILayer,
} from '@/engineV2/models'
import { View } from '@/engineV2/views'
import { RGBA } from '@/utils'

/**
 * We currently have the ability to render edge voxels with a different
 * opacity, however this is supressed for now.
 */
const useEdgeRendering = false

/**
 * Maps the `RGBA` color to an rgb color with alpha set as the default alpha.
 * 
 * @param color The class color to map.
 * @returns The color as a 4-element array.
 */
function getSegmentColorWithAlpha (color: RGBA): number[] {
  return [color.r, color.g, color.b, Math.floor(defaultAlpha * 255)]
}

/**
 * Maps the `RGBA` color to an rgb color with alpha set as the raster outline alpha.
 * 
 * @param color The class color to map.
 * @returns The color as a 4-element array.
 */
function getSegmentEdgeColorWithAlpha (color: RGBA): number[] {
  return [color.r, color.g, color.b, Math.floor(rasterOutlineAlpha * 255)]
}

/**
 * Gets the labelmap canvas (canvas with same dimensions as the underlying source image).
 * 
 * @param raster The raster to render.
 * @param annotations The mask annotations on the raster.
 * @returns The canvas which can then be drawn onto the screen-scale canvas.
 */
function getLabelmapCanvas (raster: Raster, annotations: Annotation[]): HTMLCanvasElement {
  const canvas = raster.cachedCanvas

  if (!raster.isInvalidated()) {
    return canvas
  }

  const { invalidatedRegion, buffer: rasterBuffer, width: rasterWidth } = raster
  const { xMin, xMax, yMin, yMax } = invalidatedRegion

  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')

  ctx.imageSmoothingEnabled = false // We want a pixelated outline.

  const colorLUT: Record<string,number[]> = {}
  const colorLUTEdge: Record<string,number[]> = {}

  // Get colors for all annotations on the raster
  const labelsOnRaster = raster.labelsOnRaster

  labelsOnRaster.forEach((labelIndex: number) => {
    const annotationIdForLabel = raster.getAnnotationMapping(labelIndex)

    const annotation = annotations.find((annotation: Annotation) => 
      annotation.id === annotationIdForLabel
    )

    if (annotation !== undefined) {
      const color = getSegmentColorWithAlpha(annotation.color)
      const edgeColor = getSegmentEdgeColorWithAlpha(annotation.color)
  
      colorLUT[labelIndex] = color
      colorLUTEdge[labelIndex] = edgeColor
    }
  })

  function isOnEdge (pixelIndex: number, labelValue: number): boolean {
    // Check if voxels above, below, left, right are different voxel colors
  
    // Left
    if (rasterBuffer[pixelIndex - 1] !== labelValue) {
      return true
    }
  
    // Right
    if (rasterBuffer[pixelIndex + 1] !== labelValue) {
      return true
    }
  
    // Up
    if (rasterBuffer[pixelIndex - rasterWidth] !== labelValue) {
      return true
    }
  
    // Down
    if (rasterBuffer[pixelIndex + rasterWidth] !== labelValue) {
      return true
    }
  
    return false
  }

  const regionWidth = xMax - xMin
  const regionHeight = yMax - yMin

  // Create RGBA ImageData. Note: initialized with all transparent black.
  const regionImageData = new ImageData(regionWidth, regionHeight)
  const data = regionImageData.data

  for (let j = yMin; j <= yMax; j++) {
    for (let i = xMin; i <= xMax; i++) {
      const pixelIndex: number = j * rasterWidth + i
      const labelValue = rasterBuffer[pixelIndex]

      let color

      if (labelValue !== 0) {
        color = useEdgeRendering && isOnEdge(pixelIndex, labelValue)
          ? colorLUTEdge[labelValue]
          : colorLUT[labelValue]

        if (!color) {
          /**
           * This means there is data on the labelmap which is not covered
           * by an annotation. Do not render it as we don't know what color
           * it should be, and it would be "dangling" data. The common reason
           * for hitting this is when the full densely packed raster layer is
           * ingested from the backend, but the annotation are still be ing
           * added to the state.
           */
          color = [0,0,0,0]
        }
      } else {
        color = [0,0,0,0]
      }

      const iRegion = i - xMin
      const jRegion = j - yMin

      const regionPixelIndex = jRegion * regionWidth + iRegion
      const pixelOffset = regionPixelIndex * 4

      // Modify ImageData.
      data[pixelOffset] = color[0] // R value
      data[pixelOffset + 1] = color[1] // G value
      data[pixelOffset + 2] = color[2] // B value
      data[pixelOffset + 3] = color[3] // A value
    }
  }

  // Put this image data onto the labelmapCanvas
  ctx.putImageData(regionImageData, xMin, yMin)

  raster.clearInvalidation()

  return canvas
}

/**
 * Clears the canvas so that we can draw the updated labelmap.
 * @param canvas The canvas to clear.
 * @param ctx The 2d canvas context.
 */
function clearCanvas (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  ctx.save()
  // Set transform to the identiy matrix as:
  // [a c e]
  // [b d f]
  // [0 0 1]
  // Where a is the first argument and f is the last.
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}

/**
 * Draws the image-sized labelmap onto the screen sized canvas.
 * The `imageSmoothingEnabled` property of the canvas context is
 * set to false during the draw, so that we get a sharp pixel mask
 * rendering for the raster (independent on whether Pixel View is
 * on for the underlying data).
 * 
 * @param camera The camera of the view for mapping from image to
 * canvas coordiantes.
 * @param ctx The raster layer canvas context.
 * @param labelmapCanvas The labelmap canvas to draw to the context.
 */
function drawNewLabelmap (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  labelmapCanvas: HTMLCanvasElement
): void {
  ctx.save()
  
  const previousImageSmoothingEnabled = ctx.imageSmoothingEnabled

  ctx.imageSmoothingEnabled = false

  camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.drawImage(labelmapCanvas, 0, 0)
  ctx.restore()

  ctx.imageSmoothingEnabled = previousImageSmoothingEnabled
}

export class MaskRenderer extends RasterTypeRenderer {
  render (view: View, layer: ILayer, raster: Raster, annotations: Annotation[]): void {    
    const camera = view.camera
    const labelmapCanvas = getLabelmapCanvas(raster, annotations)
    const layerCanvas = layer.canvas
    const layerCtx = layer.context as CanvasRenderingContext2D

    clearCanvas(layerCanvas, layerCtx)
    drawNewLabelmap(camera, layerCtx, labelmapCanvas)
  }
}
