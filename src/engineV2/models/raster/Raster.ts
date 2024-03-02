import { v4 as uuidv4 } from 'uuid'

import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Note as we have chose to use Uint8Arrays on the frontend to limit memory usage,
 * we currently support 255 labels/annotations on a single raster. If we need more
 * we will need to use 2 bytes/pixel and then we'll be able to support 65535
 * segments. But this will come at higher memory usage for every use case unless we.
 * Smartly choose/migrate based on the number of segments.
 */
const maxLabels: number = 255

/**
 * An object which contains the raw data used to display a raster mask.
 * Each raster has its own id and references a particular file to which
 * it is associated. The size of the raster is automatically derived
 * from the file it is associated with.
 */
export class Raster {
  public id: string
  public fileId: string
  public readonly width: number
  public readonly height: number
  public readonly size: number
  public buffer: Uint8Array
  private invalidated: boolean
  private _invalidatedRegion: {
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number
  }
  private _labelIndexToAnnotationId: Map<number,string> = new Map()
  private _annotationIdToLabelIndex: Map<string,number> = new Map()
  private _cachedCanvas?: HTMLCanvasElement
  private _labelsOnRaster: Set<number> = new Set()
  private _inProgressAnnotations: Map<string, Annotation> = new Map()
  private readonly view: View

  constructor (
    view: View,
  ) {
    const currentFile = view.fileManager.file

    if (currentFile.metadata === undefined) {
      throw new Error('Need file in view to create raster')
    }

    const fileId = currentFile.id
    this.view = view

    this.id  = uuidv4()
    this.fileId = fileId

    const { metadata } = currentFile
    const { width, height } = metadata
    const size = width * height

    this.width = width
    this.height = height
    this.size = size
    this.buffer = new Uint8Array(size)
    this.invalidated = true
    this._invalidatedRegion = {
      xMin: 0,
      xMax: width,
      yMin: 0,
      yMax: height
    }
  }

  get cachedCanvas (): HTMLCanvasElement {
    if (this._cachedCanvas !== undefined) {
      return this._cachedCanvas
    }

    const canvas = document.createElement('canvas')

    canvas.width = this.width
    canvas.height = this.height

    this._cachedCanvas = canvas

    return canvas
  }

  get invalidatedRegion () : ({
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number
  }) {
    return { ...this._invalidatedRegion }
  }

  /**
   * Finds and returns the lowest unused label index that isn't zero,
   * which is reserved for empty/unlabelled. Note this isn't just one
   * greater than the number of labels, as a slot might have opened
   * up from deletion.
   * @returns The label index
   */
  public getNextAvailableLabelIndex (): number {
    const labelsOnRaster = this._labelsOnRaster

    for (let i = 1; i < maxLabels; i++) {
      if (!labelsOnRaster.has(i)) {
        return i
      }
    }

    throw new Error(`Reached max available segments, currently support ${maxLabels}`)
  }

  public getLabelIndexForAnnotationId (annotationId: string): number | undefined {
    return this._annotationIdToLabelIndex.get(annotationId)
  }

  public getAnnotationMapping (labelIndex: number): string | undefined {
    return this._labelIndexToAnnotationId.get(labelIndex)
  }

  public setAnnotationMapping (labelIndex: number, annotationId: string): void {
    this._labelIndexToAnnotationId.set(labelIndex, annotationId)
    this._annotationIdToLabelIndex.set(annotationId, labelIndex)
    this._labelsOnRaster.add(labelIndex)
  }

  public deleteAnnotationMapping ( labelIndex: number): void {
    const annotationId = this.getAnnotationMapping(labelIndex)

    if (annotationId !== undefined) {
      this._annotationIdToLabelIndex.delete(annotationId)
    }

    this._labelIndexToAnnotationId.delete(labelIndex)
    this._labelsOnRaster.delete(labelIndex)
  }

  public clearAnnotationMappings (): void {
    this._labelIndexToAnnotationId.clear()
    this._annotationIdToLabelIndex.clear()
    this._labelsOnRaster = new Set()
  }

  /**
   * Annotation mapping methods:
   * Used to store temporary annotations for rendering during annotation creation
   * (e.g.) during a brush stroke, or during some preview of a complex raster annotation tool.
   */
  public getInProgressAnnotation (annotationId: string): Annotation | undefined {
    return this._inProgressAnnotations.get(annotationId)
  }

  public setInProgressAnnotation (annotation: Annotation): void {
    this._inProgressAnnotations.set(annotation.id, annotation)
  }

  public clearInProgressAnnotations (): void {
    this._inProgressAnnotations.clear()
  }

  public get labelsOnRaster (): number[] {
    return Array.from(this._labelsOnRaster)
  }

  public get annotationIdsOnRaster (): string[] {
    const labelsOnRaster = this.labelsOnRaster

    const annotationIdsOnRaster: string[] = []

    labelsOnRaster.forEach((labelIndex: number) => {
      const annotationId = this.getAnnotationMapping(labelIndex)

      if (annotationId !== undefined) {
        annotationIdsOnRaster.push(annotationId)
      }
    })

    return annotationIdsOnRaster
  }

  public invalidate (xMin: number, xMax: number, yMin: number, yMax: number): void {
    this._invalidatedRegion = {
      xMin,
      xMax,
      yMin,
      yMax
    }
    this.invalidated = true

    const rasterLayer = this.view.rasterAnnotationLayer

    if (rasterLayer === undefined) {
      throw new Error('Raster layer not enabled')
    }

    rasterLayer.changed()
    rasterLayer.render()
  }

  public isInvalidated (): boolean {
    return this.invalidated
  }

  /**
   * To be called when the invalidation of the data has been consumed by the renderer
   */
  public clearInvalidation (): void {
    this.invalidated = false
  }

  /**
   * Frees up memory when we no longer need the cached canvas
   */
  public freeMemory (): void {
    delete this._cachedCanvas
    this.invalidate(0, this.width - 1, 0, this.height - 1)
  }
}
