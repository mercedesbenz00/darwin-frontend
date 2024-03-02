import Vue from 'vue'

import { View, Annotation, AnnotationData, MeasureOverlayData } from '@/engine/models'

export interface MeasureOverlayer {
  calculateMeasures (
    view: View,
    data: AnnotationData
  ): Pick<MeasureOverlayData, 'label' | 'measures'>
  calculateDrawingMeasureOverlayData(view: View, data: AnnotationData): MeasureOverlayData | null
  calculateMeasureOverlayData(view: View, annotation: Annotation): MeasureOverlayData | null
}

export class MeasureManager {
  private view: View

  private measureOverlayer = new Map<string, MeasureOverlayer>()

  public readonly DRAWING_ANNOTATION_ID = 'drawing-annotation'

  // This should be kept as reactive as this is used by
  // Workview component to render annotation overlays.
  public measureOverlayDataEntries: Record<string, MeasureOverlayData> = {}

  constructor (view: View) {
    this.view = view
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
    this.measureOverlayDataEntries = this.view.visibleAnnotations
      .map(a => this.getMeasureOverlay(a))
      .filter((a): a is MeasureOverlayData => !!a)
      .reduce((map: { [key: string]: MeasureOverlayData }, entry) => {
        map[entry.id] = entry
        return map
      }, {})
  }

  public updateOverlayForDrawingAnnotation (overlay: MeasureOverlayData): void {
    const newOverlay = {
      ...overlay,
      id: this.DRAWING_ANNOTATION_ID
    }

    const entry = this.measureOverlayDataEntries[newOverlay.id]
    if (entry === undefined) {
      Vue.set(this.measureOverlayDataEntries, newOverlay.id, newOverlay)
      return
    }

    Vue.set(this.measureOverlayDataEntries, newOverlay.id, newOverlay)
  }

  public updateOverlayForAnnotation (annotation: Annotation): void {
    const newOverlay = this.getMeasureOverlay(annotation)
    if (!newOverlay) { return }

    const entry = this.measureOverlayDataEntries[annotation.id]
    if (entry === undefined) {
      Vue.set(this.measureOverlayDataEntries, newOverlay.id, newOverlay)
      return
    }

    Vue.set(this.measureOverlayDataEntries, newOverlay.id, newOverlay)
  }

  public removeOverlayForAnnotation (annotation: Annotation) {
    const entry = this.measureOverlayDataEntries[annotation.id]
    if (entry === undefined) { return }
    Vue.delete(this.measureOverlayDataEntries, annotation.id)
  }

  public removeOverlayForDrawingAnnotation () {
    const entry = this.measureOverlayDataEntries[this.DRAWING_ANNOTATION_ID]
    if (entry === undefined) { return }
    Vue.delete(this.measureOverlayDataEntries, this.DRAWING_ANNOTATION_ID)
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
}
