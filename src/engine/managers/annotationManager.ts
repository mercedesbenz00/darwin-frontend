import { debounce } from 'lodash'

import { IAnnotationManager } from '@/engine/managers/IAnnotationManager'
import { Annotation } from '@/engine/models/annotation'
import { IView } from '@/engine/models/views/types'
import { BOUNDING_BOX_ANNOTATION_TYPE } from '@/engine/plugins/boundingBox/types'
import { CallbackHandle, CallbackHandleCollection } from '@/engineCommon/callbackHandler'
import { ERROR_MESSAGES } from '@/errors'
import createStageAnnotation from '@/store/modules/workview/actions/createStageAnnotation'
import deleteStageAnnotation from '@/store/modules/workview/actions/deleteStageAnnotation'
import updateStageAnnotation from '@/store/modules/workview/actions/updateStageAnnotation'
import {
  UPDATE_ANNOTATIONS_VISIBILITY
} from '@/store/modules/workview/mutations/UPDATE_ANNOTATIONS_VISIBILITY'
import {
  StageAnnotation
} from '@/store/modules/workview/types'
import { compareByZIndexCamelcase } from '@/store/modules/workview/utils'
import {
  StoreActionResponse,
  StoreMutationPayload,
  WorkflowStagePayload
} from '@/store/types'
import { isErrorResponse, ErrorWithMessage, ParsedValidationError } from '@/utils'
import { ErrorCodes } from '@/utils/error/errors'

import { isMainAnnotationTypeRenderer } from './renderManager'

export class AnnotationManager implements IAnnotationManager {
  protected view: IView

  selectedAnnotationIds: Annotation['id'][] = []
  highlightedAnnotationIds: Annotation['id'][] = []

  /**
   * Current image annotations
   *
   * Include both tag and non-tag annotations.
   *
   * Normalized from stage or master annotations, ready to be rendered
   */
  annotationsMap: { [key: Annotation['id']]: Annotation } = {}

  /**
   * Keeps annotation keys as an Array to suuport reactivity
   *
   * Should always be sorted in descening order of z_index, with nulls (tags) last
   */
  annotationsIds: Annotation['id'][] = []

  constructor (view: IView) {
    this.view = view
  }

  private memoGetAnnotations: { key: string, result: Annotation[] } = {
    key: '',
    result: []
  }

  /**
   * Returns sorted by zIndex Annotations array
   */
  get annotations (): Annotation[] {
    const stringifyArr = JSON.stringify(this.annotationsIds)
    if (!stringifyArr || stringifyArr !== this.memoGetAnnotations.key) {
      this.memoGetAnnotations.key = stringifyArr
      this.memoGetAnnotations.result = this.annotationsIds.map(
        (id) => this.getAnnotation(id) as Annotation
      )
    }

    return this.memoGetAnnotations.result
  }

  private memoGetViewsAnnotations: { key: string, result: Annotation[] } = {
    key: '',
    result: []
  }

  /**
   * Returns sorted by zIndex Annotations array consistent with the active frames
   */
  get viewsAnnotations (): Annotation[] {
    const stringifyArr = JSON.stringify(this.annotationsIds)

    if (!stringifyArr || stringifyArr !== this.memoGetViewsAnnotations.key) {
      this.memoGetViewsAnnotations.key = stringifyArr
      this.memoGetViewsAnnotations.result = this.annotationsIds
        .map((id) => this.getAnnotation(id) as Annotation)
        .filter((annotation: Annotation) => {
          return annotation.data.segments.some((range: [number, number]) => {
            return range[0] >= this.view.firstFrameIndex &&
              range[1] <= this.view.lastFrameIndex + 1
          })
        })
    }

    return this.memoGetViewsAnnotations.result
  }

  private memoGetTagAnnotations: { key: string, result: Annotation[] } = {
    key: '',
    result: []
  }

  get tagAnnotations (): Annotation[] {
    const stringifyArr = JSON.stringify(this.annotationsIds)

    if (!stringifyArr || stringifyArr !== this.memoGetTagAnnotations.key) {
      this.memoGetTagAnnotations.key = stringifyArr
      this.memoGetTagAnnotations.result = this.annotations.filter(a => a.type === 'tag')
    }

    return this.memoGetTagAnnotations.result
  }

  protected onAnnotationsChangeCallbacks: CallbackHandleCollection<[]> =
    new CallbackHandleCollection<[]>()

  public onAnnotationsChange (
    cb: () => void
  ): CallbackHandle {
    return this.onAnnotationsChangeCallbacks.add(cb)
  }

  shiftZIndices (annotation: Annotation, oldZIndex: number): void {
    if (oldZIndex === annotation.zIndex) { return }

    const { id, zIndex: newZIndex } = annotation
    if (!newZIndex) { return }

    if (newZIndex > oldZIndex) {
      this.annotations
        .filter(
          (a) =>
            a.zIndex !== null && a.zIndex <= newZIndex && a.zIndex > oldZIndex && a.id !== id
        )
        .forEach(a => { a.zIndex! -= 1 })
    }

    if (newZIndex < oldZIndex) {
      this.annotations
        .filter(
          (a) =>
            a.zIndex !== null && a.zIndex < oldZIndex && a.zIndex >= newZIndex && a.id !== id
        )
        .forEach(a => { a.zIndex! += 1 })
    }
  }

  public getMaxZIndex (annotations: Annotation[]): number {
    const numbers: number[] = annotations.map(a => a.zIndex).filter(z => z !== null) as number[]

    if (!numbers.length) { return 0 }

    return Math.max(
      ...numbers
    )
  }

  /**
   * Called when current annotations change
   *
   * Current annotations could be master annotations,
   * active stage annotations or previous stage annotations.
   */
  public setAnnotations (storeAnnotations: StageAnnotation[]): void {
    this.clearMemo()
    this.annotationsIds = []
    this.annotationsMap = {}
    // First, put bounding boxes annotations first, otherwise creating
    // and initializing strings, graphs and tables fails
    const sortedByTypeAnnotations = storeAnnotations
      .sort((a, b) => this.compareByBoundingBox(a, b))
      .map(p => Annotation.createFromDeserializable(this.view, p))
      .filter((n): n is Annotation => !!n)
    sortedByTypeAnnotations.forEach(annotation => {
      annotation.initializeCachedAttributes()
      this.pushAnnotation(annotation)
    })

    this.sortByZIndex()

    this.onAnnotationsChangeCallbacks.call()
  }

  protected compareByBoundingBox (a: StageAnnotation, b: StageAnnotation): number {
    const { editor } = this.view
    const typeA = editor.resolveAnnotationType(a, this.view)
    const typeB = editor.resolveAnnotationType(b, this.view)
    if (!typeA || !typeB) { return 0 }

    if (typeA === BOUNDING_BOX_ANNOTATION_TYPE) { return -1 }
    if (typeB === BOUNDING_BOX_ANNOTATION_TYPE) { return 1 }
    return 0
  }

  public handleHighlightAnnotation (id: string): void {
    (this.highlightedAnnotationIds || []).forEach(highlightedId => {
      if (this.hasAnnotation(highlightedId)) { this.annotationsMap[highlightedId].unhighlight() }
    })
    this.highlightedAnnotationIds = []
    this.highlightedAnnotationIds.push(id)
    if (this.hasAnnotation(id)) { this.annotationsMap[id].highlight(false) }
    // We rely on reactivity so it should redefine annotations map to trigger
    this.annotationsMap = { ...this.annotationsMap }
    this.view.annotationsLayer.changed()
  }

  public handleUnhighlightAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.unhighlight()
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleUnhighlightAllAnnotations (): void {
    this.highlightedAnnotationIds.forEach(highlightedId => {
      if (this.hasAnnotation(highlightedId)) { this.annotationsMap[highlightedId].unhighlight() }
    })
    this.highlightedAnnotationIds = []
    // We rely on reactivity so it should redefine annotations map to trigger
    this.annotationsMap = { ...this.annotationsMap }
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleSelectAnnotation (id: string): void {
    (this.selectedAnnotationIds || []).forEach(selectedId => {
      if (this.hasAnnotation(selectedId)) { this.annotationsMap[selectedId].deselect(false) }
    })
    this.selectedAnnotationIds = []
    this.selectedAnnotationIds.push(id)
    if (this.hasAnnotation(id)) { this.annotationsMap[id].select(false) }
    // We rely on reactivity so it should redefine annotations map to trigger
    // isSelected check inside VideoAnnotationsItem
    this.annotationsMap = { ...this.annotationsMap }
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleDeselectAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.deselect(false)
    // We rely on reactivity so it should redefine annotations map to trigger
    // isSelected check inside VideoAnnotationsItem
    this.annotationsMap = { ...this.annotationsMap }
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleDeselectAllAnnotations (): void {
    (this.selectedAnnotationIds || []).forEach(id => {
      if (this.hasAnnotation(id)) { this.annotationsMap[id].deselect(false) }
    })
    this.selectedAnnotationIds = []
    // We rely on reactivity so it should redefine annotations map to trigger
    // isSelected check inside VideoAnnotationsItem
    this.annotationsMap = { ...this.annotationsMap }
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleShowAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.show(false)
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleHideAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.hide(false)
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public updateAnnotationsVisibility (
    payload: StoreMutationPayload<typeof UPDATE_ANNOTATIONS_VISIBILITY>
  ): void {
    this.annotations.forEach(annotation => {
      if (payload.annotationIds.includes(annotation.id)) {
        payload.visibility ? annotation.show(false) : annotation.hide(false)
      }
    })

    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public handleToggleAnnotations (): void {
    const renderAnnotations = this.view.store.state.workview.renderAnnotations
    this.annotations.forEach(annotation => {
      renderAnnotations ? annotation.show(false) : annotation.hide(false)
    })
    this.view.annotationsLayer.changed()
    this.clearMemo()
  }

  public getAnnotation (id: Annotation['id']): Annotation | undefined {
    const annotation = this.annotationsMap[id]

    if (!annotation) {
      console.warn("Can't get annotation!")
      return
    }

    return annotation
  }

  protected get currentStageInstance (): WorkflowStagePayload | null {
    return this.view.store.state.workview.selectedStageInstance
  }

  /** Persist a new annotation to the backend. */
  async persistCreateAnnotation (annotation: Annotation): Promise<Annotation | null> {
    try {
      const params = annotation.serialize()
      if (!params) { throw new Error() }

      const response: StoreActionResponse<typeof createStageAnnotation> =
        await this.view.store.dispatch('workview/createStageAnnotation', params)

      if ('error' in response) {
        this.onSaveError(response.error)
        return null
      }

      const newAnnotation = Annotation.createFromDeserializable(this.view, response.data)

      if (!newAnnotation) { throw new Error() }

      this.handlePushAnnotation(newAnnotation)

      return newAnnotation
    } catch (e: unknown) {
      console.error(e)

      if (isErrorResponse(e)) {
        const { message = ERROR_MESSAGES.DEFAULT_ERROR_MESSAGE } = e
        this.view.editor.toast({ message, isError: true })
      }

      return null
    }
  }

  protected handlePushAnnotation (annotation: Annotation): void {
    if (this.hasAnnotation(annotation.id)) { return }

    // in 1.0, annotations are associated to stage, so we exit early if affected
    // annotation is not associated
    const { currentStageInstance } = this
    if (!currentStageInstance) { return }
    if (annotation.workflowStageId !== currentStageInstance.id) { return }

    this.pushAnnotation(annotation)
    this.sortByZIndex()

    this.onAnnotationsChangeCallbacks.call()
  }

  /** Remove a persisted annotation from the backend */
  async persistDeleteAnnotation (annotation: Annotation): Promise<Annotation['id'] | null> {
    try {
      const params = annotation.serialize()
      if (!params) { throw new Error() }

      const response: StoreActionResponse<typeof deleteStageAnnotation> =
        await this.view.store.dispatch('workview/deleteStageAnnotation', params)

      if ('error' in response) {
        this.onSaveError(response.error)
        return null
      }

      this.handleRemoveAnnotation(annotation.id)

      return annotation.id
    } catch (e: unknown) {
      console.error(e)

      if (isErrorResponse(e)) {
        const { message = ERROR_MESSAGES.DEFAULT_ERROR_MESSAGE } = e
        this.view.editor.toast({ message, isError: true })
      }

      return null
    }
  }

  protected handleRemoveAnnotation (annotationId: Annotation['id']): void {
    if (!this.hasAnnotation(annotationId)) { return }

    this.removeAnnotation(annotationId)

    this.highlightedAnnotationIds = []
    this.selectedAnnotationIds = []
    this.clearMemo()

    this.onAnnotationsChangeCallbacks.call()
  }

  private debouncePersistUpdateAnnotation = debounce(
    async (annotation: Annotation): Promise<void> => {
      try {
        const params = annotation.serialize()
        if (!params) { throw new Error("Couldn't serialize annotation") }

        const response: StoreActionResponse<typeof updateStageAnnotation> =
        await this.view.store.dispatch('workview/updateStageAnnotation', params)

        if ('error' in response) {
          this.onSaveError(response.error)
          // Redraw layer with reverted changed
          this.view.annotationsLayer.changed()
        }
      } catch (e: unknown) {
        console.error(e)

        if (isErrorResponse(e)) {
          const { message = ERROR_MESSAGES.DEFAULT_ERROR_MESSAGE } = e
          this.view.editor.toast({ message, isError: true })
        }
      }
    }, 500)

  /** Persist an updated annotation to the backend */
  persistUpdateAnnotation (annotation: Annotation): void {
    // optimistic UI
    this.handleUpdateAnnotation(annotation)

    this.debouncePersistUpdateAnnotation(annotation)
  }

  protected handleUpdateAnnotation (updatedAnnotation: Annotation): void {
    // in 1.0, annotations are associated to stage, so we exit early if affected
    // annotation is not associated
    const { currentStageInstance } = this
    if (!currentStageInstance) { return }
    if (updatedAnnotation.workflowStageId !== currentStageInstance.id) { return }

    if (this.hasAnnotation(updatedAnnotation.id)) {
      const oldAnnotation = this.getAnnotation(updatedAnnotation.id)
      if (!oldAnnotation) { return }
      const oldZIndex = oldAnnotation.zIndex

      this.keepAnnotationVertexSelectedStatus(oldAnnotation, updatedAnnotation)

      this.setAnnotation(updatedAnnotation.shallowClone({
        isHighlighted: oldAnnotation.isHighlighted,
        isSelected: oldAnnotation.isSelected,
        isVisible: oldAnnotation.isVisible
      }))

      if (oldZIndex !== null) {
        this.shiftZIndices(updatedAnnotation, oldZIndex)
      }
    } else {
      this.pushAnnotation(updatedAnnotation)
    }

    this.sortByZIndex()

    this.clearMemo()

    this.onAnnotationsChangeCallbacks.call()
  }

  public handleRemoveAnnotations (payload: StageAnnotation[]): void {
    payload.forEach(a => this.removeAnnotation(a.id))

    this.clearMemo()

    this.onAnnotationsChangeCallbacks.call()
  }

  protected keepAnnotationVertexSelectedStatus (
    oldAnnotation: Annotation,
    newAnnotation: Annotation
  ): void {
    const renderer = this.view.renderManager.rendererFor(oldAnnotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return }
    const vertices = renderer.getAllVertices(oldAnnotation, this.view)
    const selectedVertexIndex = vertices.findIndex(v => v.isSelected)

    if (selectedVertexIndex < 0) { return }

    const newVertices = renderer.getAllVertices(newAnnotation, this.view)
    if (!newVertices[selectedVertexIndex]) { return }
    newVertices[selectedVertexIndex].isSelected = true
  }

  public cleanup (): void {
    this.annotations.forEach(a => a.clear())
    this.annotationsIds = []
    this.annotationsMap = {}
    this.clearMemo()
  }

  public hasAnnotation (id: Annotation['id']): boolean {
    return this.annotationsIds.includes(id)
  }

  protected pushAnnotation (payload: Annotation): void {
    if (this.annotationsIds.includes(payload.id)) { return }
    this.annotationsIds.push(payload.id)
    this.annotationsMap[payload.id] = payload
    this.clearMemo()
  }

  protected setAnnotation (payload: Annotation): void {
    if (this.hasAnnotation(payload.id)) { this.annotationsMap[payload.id].clearCache() }
    this.annotationsMap[payload.id] = payload
    delete this.annotationsMap[payload.id].path2D

    this.clearMemo()
  }

  protected removeAnnotation (id: Annotation['id']): void {
    const idx = this.annotationsIds.indexOf(id)
    this.annotationsIds.splice(idx, 1)
    delete this.annotationsMap[id]
    this.clearMemo()
  }

  protected sortByZIndex (): void {
    this.annotationsIds.sort((a, b) =>
      compareByZIndexCamelcase(
        this.getAnnotation(a) as Annotation,
        this.getAnnotation(b) as Annotation
      )
    )
  }

  protected onSaveError (error?: ErrorWithMessage | ParsedValidationError): void {
    // Ignores error handling for validation errors
    if (error && 'isValidationError' in error) { return }

    const code = error ? error.code : null

    if (code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.view.store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    const messageFromCode = code === ErrorCodes.ALREADY_IN_WORKFLOW
      ? 'Cannot self-assign item. You are already assigned to a different stage in the workflow.'
      : null

    const parsedMessage = error ? error.message : null
    const defaultMessage =
      'Unable to save changes. Please refresh your browser. If not, your work might not get saved.'

    const message = messageFromCode || parsedMessage || defaultMessage

    this.view.editor.toast({ message, isError: true })
  }

  protected clearMemo (): void {
    this.memoGetAnnotations = {
      key: '',
      result: []
    }
    this.memoGetViewsAnnotations = {
      key: '',
      result: []
    }
    this.memoGetTagAnnotations = {
      key: '',
      result: []
    }
  }
}
