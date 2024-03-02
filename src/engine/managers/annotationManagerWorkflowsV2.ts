import { IAnnotationManager } from '@/engine/managers/IAnnotationManager'
import { Annotation } from '@/engine/models'
import { deleteV2Annotation } from '@/store/modules/workview/actions/deleteV2Annotation'
import { StoreActionResponse } from '@/store/types'
import { ErrorWithMessage } from '@/utils'

import { AnnotationManager } from './annotationManager'

export class AnnotationManagerWorkflowsV2 extends AnnotationManager implements IAnnotationManager {
  /** Persist a new annotation to the backend. */
  async persistCreateAnnotation (annotation: Annotation): Promise<Annotation | null> {
    const params = annotation.serialize()
    if (!params) { return null }

    const response = await this.view.store.dispatch('workview/createV2Annotation', params)
    if (response.error) { this.onSaveError(response.error) }

    const newAnnotation = Annotation.createFromDeserializable(this.view, response.data)

    if (!newAnnotation) { return null }

    this.handlePushAnnotation(newAnnotation)

    return newAnnotation
  }

  protected handlePushAnnotation (annotation: Annotation): void {
    if (this.hasAnnotation(annotation.id)) { return }

    this.pushAnnotation(annotation)
    this.sortByZIndex()

    this.onAnnotationsChangeCallbacks.call()
  }

  /** Remove a persisted annotation from the backend */
  async persistDeleteAnnotation (annotation: Annotation): Promise<Annotation['id'] | null> {
    const params = annotation.serialize()
    if (!params) { return null }

    const response: StoreActionResponse<typeof deleteV2Annotation> =
      await this.view.store.dispatch('workview/deleteV2Annotation', params)

    if ('error' in response) {
      this.onSaveError(response.error as ErrorWithMessage)
    }

    return annotation.id
  }

  /** Update a persisted annotation to the backend */
  async persistUpdateAnnotation (annotation: Annotation): Promise<Annotation | null> {
    const params = annotation.serialize()
    if (!params) { return null }

    const response = await this.view.store.dispatch('workview/updateV2Annotation', params)
    if (response.error) { this.onSaveError(response.error) }

    const newAnnotation = Annotation.createFromDeserializable(this.view, response.data)

    if (!newAnnotation) { return null }

    this.handleUpdateAnnotation(newAnnotation)

    return newAnnotation
  }

  protected handleUpdateAnnotation (updatedAnnotation: Annotation): void {
    if (this.hasAnnotation(updatedAnnotation.id)) {
      const oldAnnotation = this.getAnnotation(updatedAnnotation.id)
      if (!oldAnnotation) { return }
      const oldZIndex = oldAnnotation.zIndex

      this.keepAnnotationVertexSelectedStatus(oldAnnotation, updatedAnnotation)

      this.setAnnotation(updatedAnnotation)

      if (oldZIndex !== null) {
        this.shiftZIndices(updatedAnnotation, oldZIndex)
      }
    } else {
      this.pushAnnotation(updatedAnnotation)
    }

    this.sortByZIndex()

    this.onAnnotationsChangeCallbacks.call()
  }
}
