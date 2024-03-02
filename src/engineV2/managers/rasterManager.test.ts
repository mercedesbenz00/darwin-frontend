import { Raster } from '@/engineV2/models'
import { View } from '@/engineV2/views/view'

import { RasterManager } from './rasterManager'

const fileId = 'fileId.1.2.3.4.5'
const annotationDeletedEventName = 'annotation:delete'
type voidFn = (payload: any) => void
const mockCallbacks: Record<string, voidFn[]> = {
  [annotationDeletedEventName]: []
}

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        callbacks: mockCallbacks,
        rasterAnnotationLayer: {
          changed: jest.fn(),
          render: jest.fn()
        },
        fileManager: {
          file: {
            id: fileId,
            metadata: {
              width: 64,
              height: 64
            }
          }
        },
        annotationManager: {
          on: (eventName: string, callback: voidFn): void => {
            if (eventName !== annotationDeletedEventName) {
              return
            }
            mockCallbacks[eventName].push(callback)
          },
          emit: (eventName: string, payload: any): void => {
            if (eventName !== annotationDeletedEventName) {
              return
            }

            mockCallbacks[eventName].forEach(callback => callback(payload) )
          } 
        }
      }
    })
  }
})
// Mock the files that extend view so this test compiles.
jest.mock('@/engineV2/views/ImageView')

let rasterManager: RasterManager
let view: View

describe('raster management', () => {
  beforeEach(() => {
    mockCallbacks[annotationDeletedEventName] = []

    // @ts-ignore -> Mock view object, don't need to pass in props.
    view = new View()
    rasterManager = new RasterManager(view)
  })

  function addTwoRastersAndGetIds (): string[] {
    const rasters = [new Raster(view), new Raster(view)]
    const rasterIds = rasters.map(raster => raster.id)

    rasters.forEach(raster => {
      rasterManager.createRaster(raster)
    })

    return rasterIds
  }

  it('creates a single raster and adds it to the manager', () => {
    const raster = new Raster(view)

    const createHandler = jest.fn()
    const changedHandler = jest.fn()

    rasterManager.on('rasters:create', createHandler)
    rasterManager.on('rasters:changed', changedHandler)

    const { id } = rasterManager.createRaster(raster)

    expect(rasterManager.hasRaster(id)).toBeTruthy()
    expect(rasterManager.getRaster(id)).toStrictEqual(raster)

    expect(createHandler).toBeCalledTimes(1)
    expect(changedHandler).toBeCalledTimes(1)
  })

  it('creates a single raster, and fails to add it to the manager twice', () => {
    const raster = new Raster(view)

    const errorHandler = jest.fn()

    rasterManager.on('rasters:error', errorHandler)

    rasterManager.createRaster(raster)
    expect(() => rasterManager.createRaster(raster)).toThrow()
    expect(errorHandler).toBeCalledTimes(1)

    rasterManager.off('rasters:error', errorHandler)
  })

  it('checks if the raster matches the file in the view', () => {
    const raster = new Raster(view)

    rasterManager.createRaster(raster)

    const rasterInView = rasterManager.getRasterForFileInView()

    expect(rasterInView).toBeDefined()
    expect((<Raster>rasterInView).fileId).toEqual(view.fileManager.file.id) 
  })

  it('adds two rasters and uses rasterManager.raster to retrieve them', () => {
    const rasterIds = addTwoRastersAndGetIds()
    const rastersOnManager = rasterManager.rasters
    
    rastersOnManager.forEach(raster => {
      expect(rasterIds.includes(raster.id)).toBeTruthy()
    })
  })

  it('adds two rasters and deletes one', () => {
    const rasterIds = addTwoRastersAndGetIds()
    const firstRaster = <Raster>rasterManager.getRaster(rasterIds[0])

    rasterManager.deleteRaster(firstRaster)

    const rastersOnManager = rasterManager.rasters

    expect(rasterManager.hasRaster(rasterIds[0])).toBeFalsy()
    expect(rastersOnManager.length).toEqual(1)
  })

  it('adds two rasters and deletes them both', () => {
    addTwoRastersAndGetIds()
    rasterManager.deleteRasters()

    const rastersOnManager = rasterManager.rasters

    expect(rastersOnManager.length).toEqual(0)
  })

  it('adds a raster and updates it', () => {
    const updateRasterSpy = jest.spyOn(rasterManager, 'updateRaster')
    const raster = new Raster(view)

    const updateHandler = jest.fn()

    rasterManager.on('rasters:update', updateHandler)

    rasterManager.createRaster(raster)

    // Some modification by a tool.
    raster.buffer[0] = 10

    rasterManager.updateRaster(raster)

    expect(updateRasterSpy).toBeCalledTimes(1)
    expect(updateHandler).toBeCalledTimes(1)

    rasterManager.off('rasters:update', updateHandler)
  })

  it('deals with mask annotation deletion', () => {
    const raster = new Raster(view)
    const rasterId = raster.id

    rasterManager.createRaster(raster)

    const mask = raster.buffer

    // Some modification by a tool.
    mask.forEach((pixelIndex: number) => mask[pixelIndex] = 1)

    const annotationId = 'annotationId1'

    raster.setAnnotationMapping(1, annotationId)

    const annotation = {
      id: annotationId,
      isRasterAnnotation: (): boolean => true,
      data: {
        rasterId,
        bounding_box: {
          x: 0,
          y: 0,
          w: 64,
          h: 64
        }
      }
    }

    view.annotationManager.emit(annotationDeletedEventName, annotation)

    for (let i = 0; i < mask.length; i++) {
      expect(mask[i]).toBe(0)
    }
  })
})
