import { EventEmitter } from 'events'

import { Annotation, AnnotationData, MeasureOverlayData } from '@/engineV2/models'
import { View } from '@/engineV2/views'
import { MeasureRegionsPayload } from '@/store/types'

export interface MeasureOverlayer {
  calculateMeasures (
    view: View,
    data: AnnotationData
  ): Pick<MeasureOverlayData, 'label' | 'measures'>
  calculateDrawingMeasureOverlayData(view: View, data: AnnotationData): MeasureOverlayData | null
  calculateMeasureOverlayData(view: View, annotation: Annotation): MeasureOverlayData | null
}

/**
 * @event measureData:changed
 */
export class MeasureManager extends EventEmitter {
  private measureOverlayer = new Map<string, MeasureOverlayer>()

  public readonly DRAWING_ANNOTATION_ID = 'drawing-annotation'

  // This should be kept as reactive as this is used by
  // Workview component to render annotation overlays.
  public measureOverlayDataEntries: Record<string, MeasureOverlayData> = {}

  constructor (private view: View) {
    super()
  }

  public get measureData (): MeasureOverlayData[] {
    return Object.values(this.measureOverlayDataEntries)
  }

  public registerMeasureOverlayer (name: string, overlayer: MeasureOverlayer): void {
    if (this.measureOverlayer.has(name)) {
      console.warn(`WARNING '${name}' is already registered for measure overlaying`)
      return
    }
    this.measureOverlayer.set(name, overlayer)
  }

  public unregisterMeasureOverlayer (name: string): void {
    if (!this.measureOverlayer.has(name)) {
      console.warn(`WARNING Trying to unregister unknown measure overlayer '${name}'`)
      return
    }
    this.measureOverlayer.delete(name)
  }

  public getMeasureOverlayer (name: string): MeasureOverlayer | undefined {
    return this.measureOverlayer.get(name)
  }

  public reset (): void {
    this.measureOverlayDataEntries = this.view.annotationManager.visibleAnnotations
      .map(a => this.getMeasureOverlay(a))
      .filter((a): a is MeasureOverlayData => !!a)
      .reduce((map: { [key: string]: MeasureOverlayData }, entry) => {
        map[entry.id] = entry
        return map
      }, {})

    this.emit('measureData:changed', this.measureData)
  }

  public updateOverlayForDrawingAnnotation (overlay: MeasureOverlayData): void {
    const newOverlay = {
      ...overlay,
      id: this.DRAWING_ANNOTATION_ID
    }

    const entry = this.measureOverlayDataEntries[newOverlay.id]
    if (entry === undefined) {
      this.measureOverlayDataEntries[newOverlay.id] = newOverlay

      this.emit('measureData:changed', this.measureData)
      return
    }

    this.measureOverlayDataEntries[newOverlay.id] = newOverlay

    this.emit('measureData:changed', this.measureData)
  }

  public updateOverlayForAnnotation (annotation: Annotation): void {
    const newOverlay = this.getMeasureOverlay(annotation)
    if (!newOverlay) { return }

    const entry = this.measureOverlayDataEntries[annotation.id]
    if (entry === undefined) {
      this.measureOverlayDataEntries[newOverlay.id] = newOverlay

      this.emit('measureData:changed', this.measureData)
      return
    }

    this.measureOverlayDataEntries[newOverlay.id] = newOverlay

    this.emit('measureData:changed', this.measureData)
  }

  public removeOverlayForAnnotation (annotationId: Annotation['id']): void {
    const entry = this.measureOverlayDataEntries[annotationId]
    if (entry === undefined) { return }
    delete this.measureOverlayDataEntries[annotationId]

    this.emit('measureData:changed', this.measureData)
  }

  public removeOverlayForDrawingAnnotation (): void {
    const entry = this.measureOverlayDataEntries[this.DRAWING_ANNOTATION_ID]
    if (entry === undefined) { return }
    delete this.measureOverlayDataEntries[this.DRAWING_ANNOTATION_ID]

    this.emit('measureData:changed', this.measureData)
  }

  public getMeasureOverlay (annotation: Annotation): MeasureOverlayData | null {
    const { view } = this
    if (!view) { return null }
    const calculator = this.measureOverlayer.get(annotation.type)
    if (!calculator) { return null }

    if (!annotation.isVideoAnnotation()) {
      return calculator.calculateMeasureOverlayData(view, annotation)
    }

    const { data: annotationData } = annotation.inferVideoData(view)
    if (!annotationData || Object.keys(annotationData).length === 0) {
      return null
    }
    return calculator.calculateMeasureOverlayData(
      view,
      annotation.shallowClone({ data: annotationData })
    )
  }

  get showMeasures (): boolean {
    return this.view.store.state.workview.renderMeasures
  }

  /**
   * Returns measure region with high priority
   * - When there is no measure region, use the image/video size
   * - When there are multiple regions, choose the one with high priority
   *   NOTE:
   *     It is possible that there can be several which has `high_priority` flag as true,
   *     In that case, we choose the first visible one.
   * - When there is only one region, choose the first one.
   */
  get measureRegion (): MeasureRegionsPayload | null {
    const { isProcessedAsVideo, isImage, metadata } = this.view.fileManager
    if (this.view.isLoading) { return null }

    if (isProcessedAsVideo) {
      if (metadata?.measure_regions?.length) {
        const measureRegions = metadata.measure_regions
        const highPriorityOne = measureRegions.find(mr => mr.high_priority)
        return highPriorityOne || measureRegions[0]
      }

      return {
        delta: { x: 1, y: 1 },
        high_priority: true,
        unit: { x: 'px', y: 'px' },
        x: 0,
        y: 0,
        w: this.view.width,
        h: this.view.height
      }
    }

    if (isImage) {
      return {
        delta: { x: 1, y: 1 },
        high_priority: true,
        unit: { x: 'px', y: 'px' },
        x: 0,
        y: 0,
        w: this.view.width,
        h: this.view.height
      }
    }

    return null
  }

  // TODO get rid of store call here
  // use local var instead and tirgger an event to call the store update
  toggleMeasures (): void {
    this.view.store.commit('workview/TOGGLE_MEASURES')
  }
}
