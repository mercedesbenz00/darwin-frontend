import { EventEmitter } from 'events'

import { CanvasPoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import {
  Annotation,
  AnnotationData,
  isVideoSubAnnotations,
  View
} from '@/engineV2/models'
import { AnnotationOverlayData } from '@/engineV2/models/annotation/AnnotationOverlayData'
import { calcCentroidPoint } from '@/engineV2/utils'
import { copyAttributes, updateArray } from '@/utils'

export interface AnnotationOverlayer {
  render(editor: Editor, annotation: Annotation, data: AnnotationData): {text: string}[]
}

/**
 * @event overlays:changed
 */
export class OverlayManager extends EventEmitter {
  private view: View;

  private annotationOverlayer = new Map<string, AnnotationOverlayer>();

  // This should be kept as reactive as this is used by
  // Workview component to render annotation overlays.
  public annotationOverlayDataEntries: Record<string, AnnotationOverlayData> = {};

  constructor (view: View) {
    super()
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

    this.view.annotationManager.visibleAnnotations
      .map(a => this.getAnnotationOverlay(a))
      .filter((a): a is AnnotationOverlayData => !!a)
      .forEach(entry => {
        this.annotationOverlayDataEntries[entry.annotationId] = entry
      })

    this.emit('overlays:changed', Object.values(this.annotationOverlayDataEntries))
  }

  public updateOverlayForAnnotation (annotation: Annotation): void {
    const newOverlay = this.getAnnotationOverlay(annotation)
    if (!newOverlay) { return }

    const entry = this.annotationOverlayDataEntries[annotation.id]
    if (entry === undefined) {
      this.annotationOverlayDataEntries[newOverlay.annotationId] = newOverlay
      this.emit('overlays:changed', Object.values(this.annotationOverlayDataEntries))
      return
    }

    copyAttributes(entry, newOverlay, { excludes: ['overlays'] })
    updateArray(entry.overlays, newOverlay.overlays, (entry) => entry.text)

    this.emit('overlays:changed', Object.values(this.annotationOverlayDataEntries))
  }

  public removeOverlayForAnnotation (annotationId: Annotation['id']): void {
    const entry = this.annotationOverlayDataEntries[annotationId]
    if (entry === undefined) { return }
    delete this.annotationOverlayDataEntries[annotationId]

    this.emit('overlays:changed', Object.values(this.annotationOverlayDataEntries))
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

    const imageCentroid = this.view.camera.canvasViewToImageView(canvasCentroid)

    if (!imageCentroid) { return null }

    const subAnnotationTypes = annotation.annotationClass
      ? this.view.annotationManager.getSubAnnotationTypesForClass(annotation.annotationClass)
      : []

    const overlays = []

    for (const type of subAnnotationTypes) {
      const overlayer = this.annotationOverlayer.get(type.name)
      if (!overlayer) { continue }

      let subAnnotation
      if (isVideoSubAnnotations(annotation.subAnnotations)) {
        const subs = this.view.annotationManager.inferVideoSubAnnotations(annotation)

        subAnnotation = subs.find(ann => ann.type === type.name)
      } else {
        subAnnotation = annotation.subAnnotations.find(ann => ann.type === type.name)
      }
      if (!subAnnotation) { continue }
      overlays.push(...overlayer.render(this.view.editor, annotation, subAnnotation.data))
    }

    return {
      x: imageCentroid.x,
      y: imageCentroid.y,
      annotationId: annotation.id,
      subAnnotationTypes,
      label: annotation.label,
      id: annotation.id,
      overlays
    }
  }

  cleanup (): void {
    this.annotationOverlayer.clear()
    this.annotationOverlayDataEntries = {}
  }
}
