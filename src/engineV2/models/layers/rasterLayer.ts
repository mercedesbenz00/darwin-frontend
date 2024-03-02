import { Camera } from '@/engineCommon/camera'
import { RasterManager } from '@/engineV2/managers'

import { Layer } from './layer'

type RenderRasterCallback = (
  rasterId: string,
  annotationsIdsInRaster: string[],
) => void

/**
 * Manages rendering process for rasters independnetly of other
 * other annotations.
 *
 * Still has support for `Object2D` annotations that may come up
 * as subannotations for Rasters in the future.
 */
export class RasterLayer extends Layer {
  private renderRaster: RenderRasterCallback
  private rasters: Set<string> = new Set()
  private readonly rasterManager: RasterManager

  constructor (camera: Camera, rasterManager: RasterManager, renderRaster: RenderRasterCallback) {
    super(camera)

    this.renderRaster = renderRaster
    this.rasterManager = rasterManager

    const triggerRerender = (): void => {
      this._hasChanges = true
      this.render()
    }

    camera.on(Camera.SCALE_CHANGED, triggerRerender)
    camera.on(Camera.OFFSET_CHANGED, triggerRerender)
    rasterManager.on(RasterManager.RASTERS_UPDATE, triggerRerender)
  }

  public getRasterIds (): string[] {
    return Array.from(this.rasters.values())
  }

  public addRaster (rasterId: string): void {
    this.rasters.add(rasterId)
    this.changed()
  }

  public removeRaster (rasterId: string): void {
    this.rasters.delete(rasterId)
    this.changed()
  }

  /**
   * Renders groups of mask annotations to single rasters in one draw call,
   * using the `Annotation` data to style the rendering of different
   * portions of the raster.
   *
   * If the layer has no changes it will skip the re-render.
   */
  public render (): void {
    if (!this.context) { return }
    if (!this._hasChanges) { return }

    this._hasChanges = false

    this.emit('before-render', this.context, this.canvas)

    this.rasters.forEach(rasterId => {
      const raster = this.rasterManager.getRaster(rasterId)

      if (raster === undefined) {
        throw new Error('Raster referened by layer is not found in RasterManager')
      }

      this.renderRaster(rasterId, raster.annotationIdsOnRaster)
    })

    // Render the subannotations (TODO: Not using these yet)
    Object.values(this._renderPool).forEach(item => {
      try {
        item.render(this.context, this.canvas)
      } catch (e: unknown) {
        console.error(e)
      }
    })

    this.emit('render', this.context, this.canvas)
  }
}
