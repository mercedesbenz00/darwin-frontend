import { Raster } from '@/engineV2/models'
import { BrushPainter } from '@/engineV2/plugins/mask/utils/BrushPainter'
import { TipShape } from '@/engineV2/plugins/pixelBrush/consts'
import { View } from '@/engineV2/views/view'

const fileId = 'fileId.1.2.3.4.5'
const classId = 1
const otherClassId = 2
const labelIndex = 1
const annotationId = 'mockAnnotationId'

let view: View
let mockRaster: Raster
const mockWidth = 6
const mockHeight = 6

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        annotationManager: {
          on: jest.fn(),
          getAnnotation: (): any => {
            return {
              id: annotationId,
              isRasterAnnotation: () => true,
              classId,
              data: {
                rasterId: mockRaster.id,
                bounding_box: {
                  x: 0,
                  y: 0,
                  w: 1,
                  h: 1
                }
              }
            }
          },
          updateAnnotationData: jest.fn(),
          updateAnnotation: jest.fn(),
          deleteAnnotation: jest.fn()
        },
        rasterAnnotationLayer: {
          changed: jest.fn(),
          render: jest.fn()
        },
        rasterManager: {
          getRasterForFileInView: (): Raster => mockRaster
        },
        fileManager: {
          file: {
            id: fileId,
            metadata: {
              width: mockWidth,
              height: mockHeight,
            }
          }
        },
      }
    })
  }
})

describe('Tests the BrushPainter class which draws strokes to rasters ', () => {
  const getPixelIndex = (x: number, y: number) => {
    return y * mockWidth + x
  }

  beforeEach(() => {
    // @ts-ignore -> Mock view object, don't need to pass in props.
    view = new View()

    // Initialise a new raster, which will have a fresh array
    mockRaster = new Raster(view)

    mockRaster.setAnnotationMapping(labelIndex, annotationId)
  })

  it('paints a circular brush stroke on the raster', () => {
    const brushPainter = new BrushPainter(view, classId, TipShape.Round, false)
    const mask = mockRaster.buffer

    // Mock the expected output
    const expectedRaster = [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 1, 1, 0,
      0, 0, 0, 1, 1, 0,
    ]

    brushPainter.stroke({x: 2.5, y: 2.5}, 1)
    brushPainter.stroke({x: 4.5, y: 5.5}, 1)
    brushPainter.endStroke()

    for (let pixelIndex =0; pixelIndex < mask.length; pixelIndex++) {
      expect(mask[pixelIndex]).toEqual(expectedRaster[pixelIndex])
    }
  })

  it('paints a square brush stroke on the raster', () => {
    const brushPainter = new BrushPainter(view, classId, TipShape.Squared, false)
    const mask = mockRaster.buffer

    // Mock the expected output
    const expectedRaster = [
      0, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1,
      1, 1, 0, 0, 0, 0,
    ]

    brushPainter.stroke({x: 0, y: 2.5}, 2)
    brushPainter.stroke({x: 5, y: 2.5}, 2)
    brushPainter.endStroke()

    for (let pixelIndex =0; pixelIndex < mask.length; pixelIndex++) {
      expect(mask[pixelIndex]).toEqual(expectedRaster[pixelIndex])
    }
  })

  it('erases a circle brush from the raster', () => {
    const brushPainter = new BrushPainter(view, classId, TipShape.Round, true)
    const mask = mockRaster.buffer

    // Put our class on the raster to be erased
    for (let y = 1; y < 3; y++) {
      for (let x = 1; x < 3; x++) {
        mask[getPixelIndex(x,y)] = classId
      }
    }

    let otherClassIdVoxelCount: number = 0

    // Put some other class on the raster that should not be erased
    for (let y = 2; y < 5; y++) {
      for (let x = 2; x < 5; x++) {
        mask[getPixelIndex(x,y)] = otherClassId

        otherClassIdVoxelCount++
      }
    }

    // Erase a big blob
    brushPainter.stroke({x: 2, y: 2}, 5)
    brushPainter.endStroke()

    const deleteAnnotationSpy = jest.spyOn(view.annotationManager, 'deleteAnnotation')

    // Expect none of our class
    for (let pixelIndex =0; pixelIndex < mask.length; pixelIndex++) {
      expect(mask[pixelIndex] === classId).toBeFalsy()
    }

    let count = 0

    // Expect the other class to remain intact
    for (let pixelIndex =0; pixelIndex < mask.length; pixelIndex++) {
      if (mask[pixelIndex] === otherClassId) {
        count++
      }
    }

    expect(otherClassIdVoxelCount).toEqual(count)
    expect(deleteAnnotationSpy).toBeCalledTimes(1)
  })
})
