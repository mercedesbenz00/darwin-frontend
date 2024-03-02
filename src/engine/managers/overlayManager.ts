import Vue from 'vue'

import { Editor } from '@/engine/editor'
import {
  Annotation,
  AnnotationData,
  isVideoSubAnnotations,
  View
} from '@/engine/models'
import { AnnotationOverlayData } from '@/engine/models/annotation/AnnotationOverlayData'
import { calcCentroidPoint } from '@/engine/utils'
import { CanvasPoint } from '@/engineCommon/point'
import { copyAttributes, updateArray } from '@/utils'

export interface AnnotationOverlayer {
  render(editor: Editor, annotation: Annotation, data: AnnotationData): {text: string}[]
}

export class OverlayManager {
  private view: View;

  private annotationOverlayer = new Map<string, AnnotationOverlayer>();

  // This should be kept as reactive as this is used by
  // Workview component to render annotation overlays.
  public annotationOverlayDataEntries: Record<string, AnnotationOverlayData> = {};

  constructor (view: View) {
    this.view = view
  }

  public registerAnnotationOverlayer (name: string, overlayer: AnnotationOverlayer): void {
    if (this.annotationOverlayer.has(name)) {
      console.warn(`WARNING '${name}' is already registered for overlaying`)
      return
    }
    this.annotationOverlayer.set(name, overlayer)
  }

  public unregisterAnnotationOverlayer (name: string): void {
    if (!this.annotationOverlayer.has(name)) {
      console.warn(`WARNING Trying to unregister unknown overlayer '${name}'`)
      return
    }
    this.annotationOverlayer.delete(name)
  }

  public reset (): void {
    this.annotationOverlayDataEntries = {}

    this.view.visibleAnnotations
      .map(a => this.getAnnotationOverlay(a))
      .filter((a): a is AnnotationOverlayData => !!a)
      .forEach(entry => {
        Vue.set(this.annotationOverlayDataEntries, entry.annotation.id, entry)
      })
  }

  public updateOverlayForAnnotation (annotation: Annotation): void {
    const newOverlay = this.getAnnotationOverlay(annotation)
    if (!newOverlay) { return }

    const entry = this.annotationOverlayDataEntries[annotation.id]
    if (entry === undefined) {
      Vue.set(this.annotationOverlayDataEntries, newOverlay.annotation.id, newOverlay)
      return
    }

    copyAttributes(entry, newOverlay, { excludes: ['overlays'] })
    updateArray(entry.overlays, newOverlay.overlays, (entry) => entry.text)
  }

  public removeOverlayForAnnotation (annotation: Annotation): void {
    const entry = this.annotationOverlayDataEntries[annotation.id]
    if (entry === undefined) { return }
    Vue.delete(this.annotationOverlayDataEntries, annotation.id)
  }

  // TODO reverted back to a non-centralised implementation not to break the logic
  private getAnnotationOverlay (annotation: Annotation): AnnotationOverlayData | null {
    let canvasCentroid: CanvasPoint | undefined

    if (annotation.isVideoAnnotation()) {
      const { data: annotationData } = annotation.inferVideoData(this.view)

      if (!annotationData || Object.keys(annotationData).length === 0) {
        return null
      }
      canvasCentroid = calcCentroidPoint(
        this.view,
        annotation.shallowClone({ data: annotationData })
      )
    } else {
      canvasCentroid = calcCentroidPoint(this.view, annotation)
    }

    if (!canvasCentroid) { return null }

    const subAnnotationTypes = annotation.annotationClass
      ? this.view.getSubAnnotationTypesForClass(annotation.annotationClass)
      : []

    const overlays = []

    for (const type of subAnnotationTypes) {
      const overlayer = this.annotationOverlayer.get(type.name)
      if (!overlayer) { continue }

      let subAnnotation
      if (isVideoSubAnnotations(annotation.subAnnotations)) {
        const subs = this.view.inferVideoSubAnnotations(annotation)

        subAnnotation = subs.find(ann => ann.type === type.name)
      } else {
        subAnnotation = annotation.subAnnotations.find(ann => ann.type === type.name)
      }
      if (!subAnnotation) { continue }
      overlays.push(...overlayer.render(this.view.editor, annotation, subAnnotation.data))
    }

    return {
      x: canvasCentroid.x,
      y: canvasCentroid.y,
      annotation,
      subAnnotationTypes,
      label: annotation.label,
      id: annotation.id,
      overlays
    }
  }

  cleanup (): void {
    this.annotationOverlayer.clear()
    Object.keys(this.annotationOverlayDataEntries).forEach(key => {
      Vue.delete(this.annotationOverlayDataEntries, key)
    })
    this.annotationOverlayDataEntries = {}
  }
}
