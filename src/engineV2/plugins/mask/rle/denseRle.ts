import { IPoint } from '@/engineCommon/point'

type Bounds = {
  topLeft: IPoint,
  bottomRight: IPoint
}
type BoundsPerLabelIndex = Record<string, Bounds>

/**
 * Generates a new `Bounds` object with the top left set
 * to ++ infinity, and the bottomRight set to --Infinity.
 * 
 * This is simple trick so that when constructing bounding boxes any
 * point will always be smaller than the default topLeft, and any
 * point will always be larger than the default bottomRight.
 * 
 * @returns A new Bounds object.
 */
const getNewInitialisedBounds = (): Bounds => {
  return {
    topLeft: {
      x: Infinity,
      y: Infinity
    },
    bottomRight: {
      x: -Infinity,
      y: -Infinity
    }
  }
}

/**
 * Converts the given pixelIndex into an x/y voxel coordinate.
 * 
 * @param pixelIndex The pixelIndex in the flattened mask array.
 * @param imageWidth The width of the mask array/underlying reference image.
 * @returns An array containing the x and y position.
 */
const pixelIndexToImagePoint = (pixelIndex: number, imageWidth: number): IPoint => {
  const y = Math.floor(pixelIndex / imageWidth)
  const x = pixelIndex % imageWidth // Remainder when we divide by the mask width.
  
  return { x, y }
}

/**
 * Updates the bounds of an annotation label on a raster from a densely RLE encoded run.
 * 
 * This is much cheaper than decoding the labelmap, and then iterating
 * through all of its points to generate bounds, as it considers entire runs at a time.
 * 
 * @param boundsPerLabelIndex The bounds per label index.
 * @param labelIndex The label index encoded on this run.
 * @param startPixelIndex The start pixel index of the run.
 * @param endPixelIndex The end pixel index of the run.
 * @param imageWidth The width of the raster mask/underlying image.
 */
const updateBounds = (
  boundsPerLabelIndex: BoundsPerLabelIndex,
  labelIndex: number,
  startPixelIndex: number,
  endPixelIndex: number,
  imageWidth: number
): void => {
  let bounds = boundsPerLabelIndex[labelIndex]

  if (bounds === undefined) {
    boundsPerLabelIndex[labelIndex] = getNewInitialisedBounds()

    bounds = boundsPerLabelIndex[labelIndex]
  }

  const startImagePoint = pixelIndexToImagePoint(startPixelIndex, imageWidth)
  const endImagePoint = pixelIndexToImagePoint(endPixelIndex, imageWidth)

  /**
   * Note: The objective of this method is to use the run to find new candidates
   * for the bounds without traversing every point.
   * 
   * The points to consider are:
   * - startImagePoint
   * - endImagePoint
   * 
   * And also, if the run extends over a line:
   * The end of the line overrun.
   * The start of the line overrun.
   * 
   * e.g for the following small example:
   */

  const potentialMinMaxPoints = [
    startImagePoint,
    endImagePoint
  ]

  const { topLeft, bottomRight } = bounds
  
  if (startImagePoint.y !== endImagePoint.y) {
    // If startImagePoint and endImagePoint aren't on same row, include another two points:
    const endOfStartImagePointRow = {
      x: imageWidth - 1,
      y: startImagePoint.y
    }
    const startOfEndImagePointRow = {
      x: 0,
      y: endImagePoint.y
    }

    potentialMinMaxPoints.push(endOfStartImagePointRow, startOfEndImagePointRow)
  }

  potentialMinMaxPoints.forEach(point => {
    const { x, y } = point

    if (x < topLeft.x) {
      topLeft.x = x
    }

    if (y < topLeft.y) {
      topLeft.y = y
    }

    if (x > bottomRight.x) {
      bottomRight.x = x
    }

    if (y > bottomRight.y) {
      bottomRight.y = y
    }
  })
}

/**
 * Calculates the bounding box of all of given label bounds.
 * @param boundsPerLabelIndex An iterable that includes numbered keys for each
 * label on the labelmap.
 * 
 * @returns The bounds encapsulating all of the bounds objects.
 */
function deriveTotalBounds (boundsPerLabelIndex: BoundsPerLabelIndex): Bounds {
  const totalBounds = getNewInitialisedBounds()

  Object.keys(boundsPerLabelIndex).forEach(((labelIndex: string) => {
    const bounds = boundsPerLabelIndex[labelIndex]

    const totalBoundsTopLeft = totalBounds.topLeft
    const totalBoundsButtomRight = totalBounds.bottomRight
    const topLeftX = bounds.topLeft.x
    const topLeftY = bounds.topLeft.y
    const bottomRightX = bounds.bottomRight.x
    const bottomRightY = bounds.bottomRight.y

    if (topLeftX < totalBoundsTopLeft.x) {
      totalBoundsTopLeft.x = topLeftX
    }

    if (topLeftY < totalBoundsTopLeft.y) {
      totalBoundsTopLeft.y = topLeftY
    }

    if (bottomRightX > totalBoundsButtomRight.x) {
      totalBoundsButtomRight.x = bottomRightX
    }

    if (bottomRightY > totalBoundsButtomRight.y) {
      totalBoundsButtomRight.y = bottomRightY
    }
  }))

  return totalBounds
}

/**
 * Encodes a mask as a dense RLE array
 * @param mask The mask to encode as a denseRLE array
 */
const encodeDenseRLE = (mask: Uint8Array): number[] => {
  const denseRLE = []

  let startOfRunIndex = 0
  let runValue = mask[startOfRunIndex]

  for (let i = 0; i < mask.length; i++) {
    const value = mask[i]

    if (value !== runValue) {
      denseRLE.push(runValue, i - startOfRunIndex)

      runValue = value
      startOfRunIndex = i
    }
  }

  // Push last run
  denseRLE.push(runValue, mask.length - startOfRunIndex)
  
  return denseRLE
}

/**
* Decodes the densely encoded RLE labelmap into the mask.
* @param denseRLE The densely-packed RLE array.
* @param totalPixels The total number of pixels to expect.
* @param imageWidth The width of the underlying image
* (so we know the shape of the intended mask)
*/
const decodeDenseRLE = (denseRLE: number[], totalPixels: number, imageWidth: number): {
  mask: Uint8Array,
  boundsPerLabelIndex: BoundsPerLabelIndex,
  totalBounds: Bounds
} => {
  const mask = new Uint8Array(totalPixels)
  const boundsPerLabelIndex: BoundsPerLabelIndex = {}

  if (denseRLE.length % 2 !== 0) {
    throw new Error('dense RLE length must by a multiple of 2 (encoded in pairs)')
  }

  if (totalPixels % imageWidth !== 0) {
    throw new Error('totalPixels is not an integer multiple of the imageWidth')
  }

  let pixelIndex = 0

  for (let pairIndex = 0; pairIndex < denseRLE.length / 2; pairIndex++) {
    const value = denseRLE[pairIndex * 2]
    const runLength = denseRLE[pairIndex * 2 + 1]

    const startPixelIndex = pixelIndex

    for (let i = 0; i < runLength; i++) {
      mask[pixelIndex] = value
      pixelIndex++

      if (pixelIndex > mask.length) {
        throw new Error('Encoded data exceeds totalPixels given.')
      }
    }

    if (value !== 0) {
      const endPixelIndex = pixelIndex - 1

      updateBounds(
        boundsPerLabelIndex,
        value,
        startPixelIndex,
        endPixelIndex,
        imageWidth
      )
    }
  }

  if (pixelIndex !== mask.length) {
    throw new Error('Not all pixels filled, incorrectly formatted dense RLE encoding.')
  }

  const totalBounds = deriveTotalBounds(boundsPerLabelIndex)

  return { mask, boundsPerLabelIndex, totalBounds }
}

export {
  encodeDenseRLE,
  decodeDenseRLE
}
