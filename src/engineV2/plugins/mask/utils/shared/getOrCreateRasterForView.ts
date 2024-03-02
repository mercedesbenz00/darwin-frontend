import { Raster } from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Given a `View` object, returns the associated raster if present,
 * or creates a new one.
 *
 * @param view The view to get/create the raster from.
 * @returns The (new) raster.
 */
export function getOrCreateRasterForView (view: View): Raster {
  const currentFile = view.fileManager.file

  if (currentFile.metadata === undefined) {
    throw new Error('No file available to annotate')
  }

  if (view.rasterManager === undefined) {
    throw new Error('rasterManager not initialised.')
  }

  // Define a new raster if one doesn't exist
  let raster = view.rasterManager.getRasterForFileInView()

  if (raster === undefined) {
    raster = new Raster(view)
    view.rasterManager.createRaster(raster)
    view.rasterAnnotationLayer?.addRaster(raster.id) // TODO_JAMES => Is this safe?
  }

  return raster
}
