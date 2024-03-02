import { Annotation } from '@/engine/models/annotation'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import {
  UPDATE_ANNOTATIONS_VISIBILITY
} from '@/store/modules/workview/mutations/UPDATE_ANNOTATIONS_VISIBILITY'
import { StageAnnotation } from '@/store/modules/workview/types'
import { StoreMutationPayload } from '@/store/types'

export interface IAnnotationManager {
  /**
   * Current image annotations
   *
   * Include both tag and non-tag annotations.
   *
   * Normalized from stage or master annotations, ready to be rendered
   */
  annotationsMap: { [key: Annotation['id']]: Annotation }

  /**
   * Keeps annotation keys as an Array to suuport reactivity
   *
   * Should always be sorted in descening order of z_index, with nulls (tags) last
   */
  annotationsIds: Annotation['id'][]

  /**
   * Returns sorted by zIndex Annotations array
   */
  readonly annotations: Annotation[]
  readonly viewsAnnotations: Annotation[]
  readonly tagAnnotations: Annotation[]

  onAnnotationsChange (cb: () => void): CallbackHandle

  getMaxZIndex (annotations: Annotation[]): number

  /**
   * Called when current annotations change
   *
   * Current annotations could be master annotations,
   * active stage annotations or previous stage annotations.
   */
  setAnnotations (storeAnnotations: StageAnnotation[]): void
  hasAnnotation (id: Annotation['id']): boolean
  getAnnotation (id: Annotation['id']): Annotation | undefined

  handleHighlightAnnotation (id: string): void
  handleUnhighlightAnnotation (id: string): void
  handleUnhighlightAllAnnotations (): void
  handleSelectAnnotation (id: string): void
  handleDeselectAnnotation (id: string): void
  handleDeselectAllAnnotations (): void
  handleShowAnnotation (id: string): void
  handleHideAnnotation (id: string): void
  handleToggleAnnotations (): void
  handleRemoveAnnotations (payload: StageAnnotation[]): void

  persistCreateAnnotation (annotation: Annotation):
    Promise<Annotation | null>
  persistDeleteAnnotation (annotationId: Annotation): Promise<Annotation['id'] | null>
  persistUpdateAnnotation (annotation: Annotation): void

  updateAnnotationsVisibility (
    payload: StoreMutationPayload<typeof UPDATE_ANNOTATIONS_VISIBILITY>
  ): void

  cleanup (): void
}
