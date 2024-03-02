/**
 * Typed class emitted when there are errors in
 * raster creation.
 */
export class RasterCreationError extends Error {
  constructor (message: string = "Can't create new raster") {
    super(message)
    this.name = 'RasterCreation'
  }
}
