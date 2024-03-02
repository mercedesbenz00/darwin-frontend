import { EventEmitter } from 'events'

import { RasterCreationError } from '@/engineV2/errors'
import {
  View,
  Raster,
  Annotation
} from '@/engineV2/models'

enum Events {
  RASTERS_CREATE = 'rasters:create',
  RASTERS_UPDATE = 'rasters:update',
  RASTERS_DELETE = 'rasters:delete',
  RASTERS_CHANGED = 'rasters:changed',
  RASTERS_ERROR = 'rasters:error'
}

/**
 * The `RasterManager` is instantiated by a `View` and manages the rasters
 * associated with images/videos displayed in this view.
 * 
 * Emits the following events:
 * @event rasters:create
 * @event rasters:update
 * @event rasters:delete
 * @event rasters:changed
 * @event rasters:error
 */
export class RasterManager extends EventEmitter {
  static RASTERS_CREATE = Events.RASTERS_CREATE
  static RASTERS_UPDATE = Events.RASTERS_UPDATE
  static RASTERS_DELETE = Events.RASTERS_DELETE
  static RASTERS_CHANGED = Events.RASTERS_CHANGED
  static RASTERS_ERROR = Events.RASTERS_ERROR

  protected readonly view: View
  private memoGetRasters: { key: string, result: Raster[] } = {
    key: '',
    result: []
  }

  /**
   * A map of all current image rasters on this view.
   */
  private rastersMap: { [key: Raster['id']]: Raster } = {}

  /**
   * Keeps raster keys as an Array to support reactivity.
   */
  private rasterIds: Raster['id'][] = []

  constructor (view: View) {
    super()
    this.view = view

    const annotationManager = view.annotationManager

    annotationManager.on('annotation:delete', this.removeAnnotationFromRaster)
  }

  // ~~~~~~ Create ~~~~~~

  /**
   * Adds the given raster to the raster manager.
   * 
   * @param raster - The raster to add to the manager.
   */
  public createRaster (raster: Raster): Raster {
    if (this.hasRaster(raster.id)) {
      this.emitError()
      throw new RasterCreationError(`Raster with id ${raster.id} already exists!`)
    }

    this.pushRaster(raster)
    this.emit(Events.RASTERS_CREATE, raster)
    this.emit(Events.RASTERS_CHANGED, this.rasters)

    this.view.rasterAnnotationLayer?.changed()

    return raster
  }

  private pushRaster (payload: Raster): void {
    if (this.rasterIds.includes(payload.id)) { return }
    this.rasterIds.push(payload.id)
    this.rastersMap[payload.id] = payload
    this.clearMemo()
  }

  // ~~~~~~ Read ~~~~~~

  /**
   * Returns true if a raster with a given `id` is present in the
   * `rasterManager`.
   * 
   * @param id The `id` of the raster to check.
   */
  public hasRaster (id: Raster['id']): boolean {
    return this.rasterIds.includes(id)
  }

  /**
   * Returns true if the `RasterManager`'s `View` contains a
   * raster already.
   */
  public hasRasterForFileInView (): boolean {
    return !!this.getRasterForFileInView()
  }

  /**
   * Returns the `Raster` on the manager with the given `id`, if present.
   * @param id The `id` of the raster to find.
   */
  public getRaster (id: Raster['id']): Raster | undefined {
    const raster = this.rastersMap[id]

    if (!raster) {
      console.warn(`raster with id ${id} not found`)
      return
    }

    return raster
  }

  /**
   * If there is a `Raster` associated with the given `file`
   * displayed the view, returns this `Raster`.
   */
  public getRasterForFileInView (): Raster | undefined {
    const rasters = this.rasters
    const currentFile = this.view.fileManager.file
    
    if (currentFile.metadata === undefined) {
      console.warn('Need file in view to find associated raster')
      return
    }

    const fileId = currentFile.id
    const raster = rasters.find(raster => raster.fileId === fileId)

    return raster
  }

  /**
   * Returns all the rasters on the manager.
   */
  get rasters (): Raster[] {
    const stringifyArr = JSON.stringify(this.rasterIds)

    if (!stringifyArr || stringifyArr !== this.memoGetRasters.key) {
      this.memoGetRasters.key = stringifyArr
      this.memoGetRasters.result = this.rasterIds.map(
        (id) => this.getRaster(id) as Raster
      )
    }

    return this.memoGetRasters.result
  }

  // ~~~~~~  Update ~~~~~~

  /**
   * Triggers events for a raster update. Ideally tools want to
   * update the `raster.buffer` directly, and call this to propogate updates.
   */
  public updateRaster (raster: Raster): void {
    if (this.hasRaster(raster.id)) {
      this.emit(Events.RASTERS_UPDATE, raster)
      this.emit(Events.RASTERS_CHANGED, this.rasters)
    } else {
      this.createRaster(raster)
    }
  }

  // ~~~~~~ Delete ~~~~~~

  /**
   * Removes the given `Raster` from the `RasterManager`, if present.
   */
  public deleteRaster (raster: Raster): Raster | null {
    if (!this.hasRaster(raster.id)) { return null }

    this.deleteRasterFromManager(raster)
    this.emit(Events.RASTERS_DELETE, raster)

    this.resetState()

    this.emit(Events.RASTERS_CHANGED, this.rasters)

    return raster
  }

  /**
   * Removes all `Rasters` stored on the `RasterManager`.
   */
  public deleteRasters (): void {
    this.rasters.forEach(raster => {
      this.deleteRasterFromManager(raster)
    })

    this.resetState()
    this.emit(Events.RASTERS_CHANGED, this.rasters)
  }

  /**
   * Internal deletion of rasters from the manager.
   */
  private deleteRasterFromManager (raster: Raster): void {
    const index = this.rasterIds.indexOf(raster.id)
    this.rasterIds.splice(index, 1)
    delete this.rastersMap[raster.id]
    this.clearMemo()
  }

  /**
   * Cleanup of individual annotation segments on the raster mask
   * when a mask annotation is deleted.
   * 
   * @param annotation The mask annotation being deleted.
   */
  private removeAnnotationFromRaster = (annotation: Annotation): void => {
    if (!annotation.isRasterAnnotation()) {
      // Not a raster annotation.
      return
    }

    const rasterId = annotation.data.rasterId
    const annotationId = annotation.id
    const boundingBox = annotation.data.bounding_box
    const raster = this.getRaster(rasterId)

    if (raster === undefined) {
      throw new Error(
        `Raster with id ${rasterId} not defined for annotation being removed.`
      )
    }

    const labelIndex = raster.getLabelIndexForAnnotationId(annotationId)

    if (labelIndex === undefined) {
      throw new Error(
        `No label associated with annotationId ${annotationId} on raster.`
      )
    }

    const mask = raster.buffer

    let xMin = 0
    let xMax = raster.width - 1
    let yMin = 0
    let yMax = raster.height - 1

    if (boundingBox) {
      const width = raster.width
  
      xMin = boundingBox.x
      xMax = boundingBox.x + boundingBox.w
      yMin = boundingBox.y
      yMax = boundingBox.y + boundingBox.h
  
      for (let y = yMin; y < yMax; y++) {
        for (let x = xMin; x < xMax; x++) {
          const pixelIndex = y * width + x
  
          if (mask[pixelIndex] === labelIndex) {
            mask[pixelIndex] = 0
          }
        }
      }
    } else {
      const length = mask.length

      for (let pixelIndex = 0; pixelIndex < length; pixelIndex++) {
        if (mask[pixelIndex] === labelIndex) {
          mask[pixelIndex] = 0
        }
      }
    }

    raster.deleteAnnotationMapping(labelIndex)
    // -1 on edges to be inclusive of the edge pixels
    raster.invalidate(xMin, xMax - 1, yMin, yMax - 1)
  }

  // ~~~ Common private methods ~~~

  private emitError (): void {
    this.emit('rasters:error')
  }

  private resetState (): void {
    this.clearMemo()
  }

  private clearMemo (): void {
    this.memoGetRasters = {
      key: '',
      result: []
    }
  }
}
