import { Camera } from '@/engineCommon/camera'
import { RasterManager } from '@/engineV2/managers/rasterManager'
import { Raster } from '@/engineV2/models'
import { View } from '@/engineV2/views/view'

import { RasterLayer } from './rasterLayer'

const fileId = 'fileId.1.2.3.4.5'

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        annotationManager: {
          on: jest.fn()
        },
        rasterAnnotationLayer: {
          changed: jest.fn()
        },
        fileManager: {
          file: {
            id: fileId,
            metadata: {
              width: 512,
              height: 512
            }
          }
        },
      }
    })
  }
})
// Mock the files that extend view so this test compiles.
jest.mock('@/engineV2/views/ImageView')

const mockRasterId1 = 'mockRasterId1'
const mockRasterId2 = 'mockRasterId2'

describe('Adding and removing ', () => {
  let rasterLayer: RasterLayer

  beforeEach(() => {
    const callback = jest.fn()
    const camera = new Camera()
    // @ts-ignore -> Mock view object, don't need to pass in props.
    const view = new View()
    const rasterManager = new RasterManager(view)

    rasterLayer = new RasterLayer(camera, rasterManager, callback)
  })

  it('adds multiple rasters and checks they are both in the list', () => {
    rasterLayer.addRaster(mockRasterId1)
    rasterLayer.addRaster(mockRasterId2)

    const rasterIds = rasterLayer.getRasterIds()

    expect(rasterIds.length).toBe(2)
    expect(rasterIds.includes(mockRasterId1)).toBeTruthy()
    expect(rasterIds.includes(mockRasterId2)).toBeTruthy()
  })

  it('removes a raster', () => {
    rasterLayer.addRaster(mockRasterId1)
    rasterLayer.removeRaster(mockRasterId1)

    const rasterIds = rasterLayer.getRasterIds()

    expect(rasterIds.length).toBe(0)
  })

  it('fails gracefully when there are no rasters on the layer', () => {
    const rasterIds = rasterLayer.getRasterIds()

    expect(rasterIds.length).toBe(0)
  })

  it('fails gracefully when removing non-existent entitites', () => {
    const removeRasterSpy = jest.spyOn(rasterLayer, 'removeRaster')

    rasterLayer.removeRaster(mockRasterId1)

    const rasterIds = rasterLayer.getRasterIds()

    expect(rasterIds.length).toBe(0)
    expect(removeRasterSpy).toBeCalledTimes(1)
  })

})

describe('Triggering rendering callback', () => {
  const annotationId1 = 'annotationId1'

  it('adds an annotations to a raster, so that the callback is called on render', () => {
    const callback = jest.fn()
    const camera = new Camera()
    // @ts-ignore -> Mock View object, don't need to pass in props.
    const view = new View()
    // @ts-ignore -> Mock RasterManger object, don't need to pass in props.
    const rasterManger = new RasterManager(view)

    const rasterLayer = new RasterLayer(camera, rasterManger, callback)

    // Create a raster, add an annotation.
    const raster = new Raster(view)
    const rasterId = raster.id

    rasterLayer.addRaster(rasterId)

    raster.setAnnotationMapping(1, annotationId1)
    // Add the raster to the manager, which the raster layer queries

    rasterManger.createRaster(raster)

    rasterLayer.render()

    expect(callback).toBeCalledWith(rasterId, [annotationId1])
  })
})
