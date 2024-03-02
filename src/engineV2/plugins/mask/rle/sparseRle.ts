type EncodeSparseRLEBounds = {
    maskWidth: number,
    topLeft: {
      x: number,
      y: number
    },
    bottomRight: {
      x: number,
      y: number,
    },
}

/**
 * Encodes the segment defined by the given `classId` from the given `mask`
 * to a sparsely RLE encoded array.
 * 
 * @param mask The mask to pull the segment from.
 * @param maskWidth Required in order to determine how to interpret
 * the flattened `mask` array.
 * @param classId The classId to pull.
 * @param bounds Optional 
 * @returns The sparse encoded RLE array for the segment.
 */
const encodeSparseRLE = (
  mask: Uint8Array,
  classId: number,
  bounds?: EncodeSparseRLEBounds
): number[] => {
  const sparseRLE: number[] = []

  // When undefined, not currently in a run
  let startOfRunIndex: number | undefined = undefined

  /**
   * Updates the current run based on the value of the voxel and current
   * run state defined by the value of `startOfRunIndex`.
   * @param pixelIndex The current pixel index within the mask.
   */
  const encodeSparseRLEProcess = (pixelIndex: number): void => {
    const value = mask[pixelIndex]

    if (value === classId && startOfRunIndex === undefined) {
      // Start of run
      startOfRunIndex = pixelIndex
    } else if (startOfRunIndex !== undefined && value !== classId) {
      // End of run
      sparseRLE.push(startOfRunIndex, pixelIndex - startOfRunIndex)
      startOfRunIndex = undefined
    }
  }

  if (bounds === undefined) {
    for (let i = 0; i < mask.length; i++) {
      encodeSparseRLEProcess(i)
    }
  } else {
    const { maskWidth, topLeft, bottomRight } = bounds

    const { x: startX, y: startY } = topLeft
    const { x: endX, y: endY } = bottomRight

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const pixelIndex = y * maskWidth + x

        encodeSparseRLEProcess(pixelIndex)

        /**
         * Additional termination criterion if we hit the edge of the
         * bounding box region.
         * 
         * Note: this is not mutually exclusive to actions in
         * encodeSparseRLEProcess, we could have started a new run and be
         * immediately terminating it with length 1 this voxel.
         */
        if (x === endX && startOfRunIndex !== undefined) {
          // End of row, which also means end of run
          sparseRLE.push(startOfRunIndex, pixelIndex - startOfRunIndex + 1)
          startOfRunIndex = undefined
        }
      }
    }
  }

  return sparseRLE
}

/**
 * Decodes the sparseRLE payload and writes to the given mask with the classId.
 * 
 * @param sparseRLE The sparely packed RLE array to decode on to the mask
 * @param mask The target raster mask to write to.
 * @param classId The classId to write to the mask with
 */
const decodeSparseRLE = (
  sparseRLE: number[],
  mask: Uint8Array,
  classId: number,
): void => {
  const length = mask.length

  if (sparseRLE.length % 2 !== 0) {
    throw new Error('sparse RLE length must by a multiple of 2 (encoded in pairs)')
  }

  if (sparseRLE.length < 3) {
    // Not even one entry, return
    return
  }

  const lastStartIndex = sparseRLE[sparseRLE.length - 2]
  const lastRunLength = sparseRLE[sparseRLE.length - 1]
  const lastEncodedPixelIndex = lastStartIndex + lastRunLength - 1

  if (lastEncodedPixelIndex > length - 1) {
    throw new Error('Encoded data exceeds mask length.')
  }

  for (let pairIndex = 0; pairIndex < sparseRLE.length / 2; pairIndex++) {
    let pixelIndex = sparseRLE[pairIndex * 2]
    const runLength = sparseRLE[pairIndex * 2 + 1]

    for (let i = 0; i < runLength; i++) {
      mask[pixelIndex] = classId
      pixelIndex++
    }
  }
}

export {
  encodeSparseRLE,
  decodeSparseRLE,
  EncodeSparseRLEBounds
}
