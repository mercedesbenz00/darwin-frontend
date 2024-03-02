import {
  encodeDenseRLE,
  decodeDenseRLE
} from './denseRle'
import {
  encodeSparseRLE,
  decodeSparseRLE
} from './sparseRle'

const mask1Length = 16
const mask1Width = 4
const incorrectMask1Width = 5
const incorrectMask1Length = 12
let mask1: Uint8Array

const createMockMask = (): Uint8Array => {
  return new Uint8Array([
    1, 1, 0, 2,
    2, 2, 1, 0,
    3, 3, 2, 2,
    1, 1, 1, 1
  ])
}

/**
 * Tests encoding/decoding of sparse RLE and dense RLE arrays.
 */
describe('denseRLE', () => {
  const denseRLEMask1 = [1,2,0,1,2,3,1,1,0,1,3,2,2,2,1,4]
  const malformedDenseRLE = [1,2,3]

  beforeEach(() => {
    // Note: Re-assign each time, as some tests modify the mask.
    mask1 = createMockMask()
  })

  it('Encodes a mask into a denseRLE array', () => {
    const denseRLE = encodeDenseRLE(mask1)

    for (let i = 0; i < denseRLE.length; i++) {
      expect(denseRLE[i]).toEqual(denseRLEMask1[i])
    }
  })

  it('Decodes a densely packed RLE array into a mask', () => {
    const {
      mask: mask1Decoded,
      totalBounds,
      boundsPerLabelIndex
    } = decodeDenseRLE(denseRLEMask1, mask1Length, mask1Width)

    // Check decoded result
    for (let i = 0; i < mask1Decoded.length; i++) {
      expect(mask1Decoded[i]).toEqual(mask1[i])
    }

    // Individual bounds
    const bounds1 = boundsPerLabelIndex[1]
    const bounds2 = boundsPerLabelIndex[2]
    const bounds3 = boundsPerLabelIndex[3]

    expect(bounds1).toBeDefined()
    expect(bounds2).toBeDefined()
    expect(bounds3).toBeDefined()

    expect(bounds1.topLeft).toEqual({ x: 0, y: 0 })
    expect(bounds1.bottomRight).toEqual({ x: 3, y: 3 })
    expect(bounds2.topLeft).toEqual({x: 0, y: 0})
    expect(bounds2.bottomRight).toEqual({x: 3, y: 2})
    expect(bounds3.topLeft).toEqual({x: 0, y: 2})
    expect(bounds3.bottomRight).toEqual({x: 1, y: 2})

    // Total bounds
    expect(totalBounds.topLeft).toEqual({x: 0, y: 0})
    expect(totalBounds.bottomRight).toEqual({x: 3, y: 3})

  })

  it('Fails to decode a badly encoded mask of odd length', () => {
    expect (() => decodeDenseRLE(malformedDenseRLE, mask1Length, mask1Width)).toThrow(
      'dense RLE length must by a multiple of 2 (encoded in pairs)'
    )
  })

  it('Fail to decode a mask with more encoded data than the given totalPixels.', () => {
    expect (() => decodeDenseRLE(denseRLEMask1, incorrectMask1Length, mask1Width)).toThrow(
      'Encoded data exceeds totalPixels given.'
    )
  })

  it('Fail to decode a mask with more encoded data than the given totalPixels.', () => {
    expect (() => decodeDenseRLE(denseRLEMask1, mask1Length, incorrectMask1Width)).toThrow(
      'totalPixels is not an integer multiple of the imageWidth'
    )
  })
})

describe('sparseRLE', () => {
  const sparseRLEMask1Class1 = [0,2,6,1,12,4]
  const malformedSparseRLEMask1Class1 = [0,2,6,1,12]

  beforeEach(() => {
    // Note: Re-assign each time, as some tests modify the mask.
    mask1 = createMockMask()
  })

  it('Encodes a mask segment into a sparseRLE array', () => {
    const sparseRLE = encodeSparseRLE(mask1, 1)

    for (let i = 0; i < sparseRLE.length; i++) {
      expect(sparseRLE[i]).toEqual(sparseRLEMask1Class1[i])
    }
  })

  it('Encodes a mask segment into a sparseRLE with a bounding box', () => {
    const mockMask2 = new Uint8Array([
      0,0,0,0,0,
      0,0,0,1,1,
      0,0,1,1,1,
      0,0,1,1,1,
      0,0,0,0,0
    ])
    
    const sparseRLEMask2Class1 = [8,2,12,3,17,3]

    const sparseRLE = encodeSparseRLE(mockMask2, 1, {
      maskWidth: 5,
      topLeft: {
        x: 2,
        y: 1
      },
      bottomRight: {
        x: 4,
        y: 4
      }
    })

    for (let i = 0; i < sparseRLE.length; i++) {
      expect(sparseRLE[i]).toEqual(sparseRLEMask2Class1[i])
    }
  })

  it('Cleanly encodes a mask segment not present in the given mask', () => {
    const sparseRLE = encodeSparseRLE(mask1, 100)

    expect(sparseRLE.length).toEqual(0)
  })

  it('Decodes a sparsely packed RLE array into a mask', () => {
    const targetMask = new Uint8Array(mask1Length)
    const targetClass = 1

    decodeSparseRLE(sparseRLEMask1Class1, targetMask, targetClass)

    for (let i = 0; i < mask1Length; i++) {
      if (mask1[i] === targetClass) {
        expect(mask1[i]).toEqual(targetMask[i])
      }
    }
  })

  it('Fails to decode a badly encoded mask of odd length', () => {
    const targetMask = new Uint8Array(mask1Length)
    expect (() => decodeSparseRLE(malformedSparseRLEMask1Class1, targetMask, 1)).toThrow(
      'sparse RLE length must by a multiple of 2 (encoded in pairs)'
    )
  })

  it('Fail to decode a mask with more encoded data than the given mask length.', () => {
    const targetMask = new Uint8Array(incorrectMask1Length)

    expect (() => decodeSparseRLE(sparseRLEMask1Class1, targetMask, 1)).toThrow(
      'Encoded data exceeds mask length.'
    )
  })
})
