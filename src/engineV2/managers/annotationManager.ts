import { EventEmitter } from 'events'

import { cloneDeep, clamp } from 'lodash'

import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { EditableImagePoint, ImagePoint, pointIsVertexOfPath } from '@/engineCommon/point'
import {
  changeAnnotationClass,
  addAnnotationAction,
  deleteAnnotationAction,
  updateAnnotationData
} from '@/engineV2/actions'
import { addAnnotationsAction } from '@/engineV2/actions/addAnnotationsAction'
import { AnnotationCreationError } from '@/engineV2/errors'
import {
  ActionGroup,
  supportsInterpolation
} from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  AnnotationTypeSerializer,
} from '@/engineV2/managers/serializerManager'
import {
  Annotation,
  CreateAnnotationParams,
  VideoSubAnnotations,
  isVideoSubAnnotations,
  ImageAnnotation,
  buildInitialSegments,
  ImageSubAnnotation,
  VideoAnnotation,
  AnnotationData,
  View
} from '@/engineV2/models'
import { BoundingBoxData } from '@/engineV2/models/annotation'
import { BOUNDING_BOX_ANNOTATION_TYPE } from '@/engineV2/plugins/boundingBox/types'
import { translateVertex, translatePath } from '@/engineV2/plugins/edit/utils'
import { STRING_ANNOTATION_TYPE } from '@/engineV2/plugins/field/types'
import { LINK_ANNOTATION_TYPE } from '@/engineV2/plugins/link/types'
import { getLinkAnnotationData } from '@/engineV2/plugins/link/utils'
import { drawPolygonToRaster } from '@/engineV2/plugins/mask/utils/drawPolygonToRaster'
import { isSkeleton, getEdgesAsPaths } from '@/engineV2/plugins/skeleton'
import { VideoSubAnnotationDataPayload } from '@/engineV2/types'
import { calcCentroidPoint, createRasterFromDeserializable } from '@/engineV2/utils'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import {
  UPDATE_ANNOTATIONS_VISIBILITY
} from '@/store/modules/workview/mutations/UPDATE_ANNOTATIONS_VISIBILITY'
import {
  StageAnnotation
} from '@/store/modules/workview/types'
import { compareByZIndexCamelcase } from '@/store/modules/workview/utils'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  StoreMutationPayload,
  ImageDataPayload,
  WorkflowStagePayload,
  VideoAnnotationData,
  AnnotationActorPayload,
  AnnotationTypePayload
} from '@/store/types'
import { getPreviousFrameIndex, rgbaString } from '@/utils'

import { isMainAnnotationTypeRenderer } from './renderManager'

/**
 * @event annotations:changed
 * @event annotation:create
 * @event annotation:update
 * @event annotation:delete
 * @event annotation:select
 * @event annotation:deselect
 * @event annotation:deselectAll
 * @event annotation:highlight
 * @event annotation:unhighlight
 * @event annotation:unhighlightAll
 * @event annotation:error
 */
export class AnnotationManager extends EventEmitter {
  protected view: View

  private selectedAnnotationIds: Annotation['id'][] = []
  private highlightedAnnotationIds: Annotation['id'][] = []

  public inferenceData: Annotation[] = []
  public annotationClasses: AnnotationClass[] = []
  private annotationMoving: Annotation | undefined
  private initialAnnotationData: AnnotationData | undefined
  public subAnnotationsTypesForClasses = new Map<number, AnnotationType[]>();

  /**
   * Current image annotations
   *
   * Include both tag and non-tag annotations.
   *
   * Normalized from stage or master annotations, ready to be rendered
   */
  annotationsMap: { [key: Annotation['id']]: Annotation } = {}

  /**
   * Keeps annotation keys as an Array to support reactivity
   *
   * Should always be sorted in descening order of z_index, with nulls (tags) last
   */
  annotationsIds: Annotation['id'][] = []

  constructor (view: View) {
    super()
    this.view = view
  }

  private memoGetAnnotations: { key: string, result: Annotation[] } = {
    key: '',
    result: []
  }

  // START: Select annotation

  public selectAnnotation (annotationId: Annotation['id']): void {
    this.deselectAllAnnotations()

    const annotation = this.getAnnotation(annotationId)
    if (!annotation) { return }

    annotation.select()
    this.selectedAnnotationIds.push(annotation.id)
    this.clearMemo()

    if (FeatureFlagsManager.isOnLayerV2) {
      const item = this.view.annotationsLayer.getItem(annotation.id)
      if (!item) {
        this.deselectAnnotation(annotation.id)
        return
      }
      item.activate()
    } else {
      this.view.annotationsLayer.changed()
    }
    this.emit('annotation:select', annotationId)
  }

  public deselectAnnotation (annotationId: Annotation['id']): void {
    const annotation = this.getAnnotation(annotationId)

    if (!annotation) { return }

    annotation.deselect()

    const index = this.selectedAnnotationIds.indexOf(annotationId)
    this.selectedAnnotationIds.splice(index, 1)
    this.clearMemo()

    if (FeatureFlagsManager.isOnLayerV2) {
      this.view.annotationsLayer.getItem(annotation.id)?.deactivate()
    } else {
      this.view.annotationsLayer.changed()
    }
    this.emit('annotation:deselect', annotationId)
  }

  public toggleSelectAnnotation (annotationId: Annotation['id']): void {
    const annotation = this.getAnnotation(annotationId)

    if (!annotation) { return }

    if (annotation.isSelected) {
      this.deselectAnnotation(annotationId)
    } else {
      this.selectAnnotation(annotationId)
    }
  }

  /**
   * Deselect all annotations.
   */
  public cachedDeselectAllAnnotations (): void {
    this.selectedAnnotationIds.forEach(id => {
      const annotation = this.getAnnotation(id)
      if (!annotation) { return }
      annotation.deselect()
      if (FeatureFlagsManager.isOnLayerV2) {
        this.view.annotationsLayer.getItem(annotation.id)?.deactivate()
      }
    })

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
    this.selectedAnnotationIds = []
    this.emit('annotation:deselectAll')
  }

  /**
   * Deselect all annotations and clear all memos.
   */
  public deselectAllAnnotations (): void {
    this.cachedDeselectAllAnnotations()
    this.clearMemo()
  }

  // END: Select annotation

  // START: Highlight annotation

  public highlightAnnotation (annotationId: Annotation['id']): void {
    this.unhighlightAllAnnotations()

    const annotation = this.getAnnotation(annotationId)
    if (!annotation) { return }

    annotation.highlight()
    this.highlightedAnnotationIds.push(annotation.id)
    this.clearMemo()

    if (FeatureFlagsManager.isOnLayerV2) {
      const item = this.view.annotationsLayer.getItem(annotationId)
      if (!item) {
        this.unhighlightAnnotation(annotationId)
        return
      }
      item.activate()
    } else {
      this.view.annotationsLayer.changed()
    }
    this.emit('annotation:highlight', annotationId)
  }

  public unhighlightAnnotation (annotationId: Annotation['id']): void {
    this.unhighlightAllAnnotationsVertices()

    const annotation = this.getAnnotation(annotationId)

    if (!annotation) { return }

    annotation.unhighlight()

    const index = this.highlightedAnnotationIds.indexOf(annotationId)
    this.highlightedAnnotationIds.splice(index, 1)
    this.clearMemo()

    if (!annotation.isSelected) {
      if (FeatureFlagsManager.isOnLayerV2) {
        this.view.annotationsLayer.getItem(annotationId)?.deactivate()
      } else {
        this.view.annotationsLayer.changed()
      }
    }
    this.emit('annotation:unhighlight', annotationId)
  }

  /**
   * Unhighlight all annotations.
   */
  public cachedUnhighlightAllAnnotations (): void {
    this.unhighlightAllAnnotationsVertices()

    this.highlightedAnnotationIds.forEach(id => {
      const annotation = this.getAnnotation(id)
      if (!annotation) { return }

      annotation.unhighlight()
      if (!annotation.isSelected) {
        if (FeatureFlagsManager.isOnLayerV2) {
          this.view.annotationsLayer.getItem(annotation.id)?.deactivate()
        }
      }
    })

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
    this.highlightedAnnotationIds = []
    this.emit('annotation:unhighlightAll')
  }

  /**
   * Unhighlight all annotations and clear all memos.
   */
  public unhighlightAllAnnotations (): void {
    this.cachedUnhighlightAllAnnotations()
    this.clearMemo()
  }

  // END: Highlight annotation

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

  private memoGetFrameAnnotations: { key: string, result: Annotation[] } = {
    key: '',
    result: []
  }

  /**
   * Returns sorted by zIndex Annotations array consistent with the active frames
   */
  get frameAnnotations (): Annotation[] {
    if (!this.view.fileManager.isProcessedAsVideo) { return this.annotations }

    const stringifyArr = JSON.stringify(this.annotationsIds) + `_${this.view.currentFrameIndex}`

    if (!stringifyArr || stringifyArr !== this.memoGetFrameAnnotations.key) {
      this.memoGetFrameAnnotations.key = stringifyArr
      this.memoGetFrameAnnotations.result = this.annotations
        .filter((annotation: Annotation) => {
          return annotation.data?.segments?.some((range: [number, number]) => {
            return range[0] <= this.view.currentFrameIndex &&
              range[1] >= this.view.currentFrameIndex + 1
          })
        })
    }

    return this.memoGetFrameAnnotations.result
  }

  public hasAnnotation (id: Annotation['id']): boolean {
    return this.annotationsIds.includes(id)
  }

  public getAnnotation (id: Annotation['id']): Annotation | undefined {
    const annotation = this.annotationsMap[id]

    if (!annotation) {
      return
    }

    return annotation
  }

  // START: Annotation create

  private _pushAnnotation (payload: Annotation): void {
    if (this.annotationsIds.includes(payload.id)) { return }
    this.annotationsIds.push(payload.id)
    this.annotationsMap[payload.id] = payload
    this.clearMemo()
  }

  /**
   * Runs the entire process creating an annotation from given params, in given
   * action group, or in the "global" action manager.
   *
   * The process
   */
  public async createAnnotationAction (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    actionGroup?: ActionGroup,
    subAnnotationParams?: any
  ): Promise<Annotation> {
    const annotation = await this.prepareAnnotationForCreation(params, subAnnotationParams)
    if (!annotation) {
      this.emitError()
      throw new AnnotationCreationError()
    }

    const actor = actionGroup || this.view.actionManager
    await actor.do(addAnnotationAction(this.view, annotation))

    return annotation
  }

  /**
   * Called from the addAnnotationAction
   * Handle annotation creation
   * @param annotation
   * @returns
   */
  public createAnnotation (annotation: Annotation): Annotation {
    if (this.hasAnnotation(annotation.id)) {
      this.emitError()
      throw new AnnotationCreationError(`Annotation with id ${annotation.id} already exists!`)
    }

    // Because of bad Annotation data type
    // we need to serialize and create new Annotation
    const payload = annotation.serialize() as StageAnnotation
    const newAnnotation = Annotation.createFromDeserializable(this.view, payload)

    if (!newAnnotation) {
      this.emitError()
      throw new AnnotationCreationError()
    }

    this._pushAnnotation(newAnnotation)
    this.emit('annotation:create', annotation)
    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit('annotations:changed', this.annotations)
    }

    this.sortByZIndex()

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }

    return annotation
  }

  // END: Annotation create

  // START: Annotation delete

  private _deleteAnnotation (payload: Annotation): void {
    const idx = this.annotationsIds.indexOf(payload.id)
    this.annotationsIds.splice(idx, 1)
    delete this.annotationsMap[payload.id]
    this.clearMemo()
  }

  /**
   * Remove a persisted annotation from the backend
   */
  public async deleteAnnotationAction (
    payload: { id: string },
    actionGroup?: ActionGroup
  ): Promise<void> {
    const { annotations } = this
    const annotation = annotations.find(a => a.id === payload.id)
    if (!annotation) { return }
    const actor = actionGroup || this.view.actionManager
    await actor.do(deleteAnnotationAction(this.view, annotation))
  }

  /**
   * Called from the deleteAnnotationAction
   * Handle annotation delete
   * @param annotation
   * @returns
   */
  public deleteAnnotation (annotation: Annotation): Annotation | null {
    if (!this.hasAnnotation(annotation.id)) { return null }

    this._deleteAnnotation(annotation)
    this.emit('annotation:delete', annotation)

    this.resetState()

    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit('annotations:changed', this.annotations)
    }

    return annotation
  }

  public deleteAnnotations (payload: StageAnnotation[]): void {
    payload.forEach(a => {
      const annotation = this.getAnnotation(a.id)
      if (!annotation) { return }
      this._deleteAnnotation(annotation)
    })

    this.resetState()
    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit('annotations:changed', this.annotations)
    }
  }

  // END: Annotation delete

  // START Annotation update

  private _setAnnotation (payload: Annotation): void {
    this.annotationsMap[payload.id].clearCache()
    this.annotationsMap[payload.id] = payload
    delete this.annotationsMap[payload.id].path2D

    this.clearMemo()
  }

  public updateAnnotation (annotation: Annotation): Annotation | null {
    if (this.hasAnnotation(annotation.id)) {
      const oldAnnotation = this.getAnnotation(annotation.id)
      if (!oldAnnotation) { return null }
      const oldZIndex = oldAnnotation.zIndex

      this.keepAnnotationVertexSelectedStatus(oldAnnotation, annotation)

      this._setAnnotation(annotation.shallowClone({
        isHighlighted: oldAnnotation.isHighlighted,
        isSelected: oldAnnotation.isSelected,
        isVisible: oldAnnotation.isVisible
      }))
      this.emit('annotation:update', annotation)

      if (oldZIndex !== null) {
        this.shiftZIndices(annotation, oldZIndex)
      }
    } else {
      this._pushAnnotation(annotation)
      this.emit('annotation:create', annotation)
    }
    this.resetState()

    if (annotation.isSelected) { this.selectAnnotation(annotation.id) }

    this.sortByZIndex()

    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit('annotations:changed', this.annotations)
    }

    return annotation
  }

  // END: Annotation update

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
    let sortedByTypeAnnotations: Annotation[]

    if (FeatureFlagsManager.isOnRasters) {
      // Logic including raster mapping
      this.resetState()

      // Get cached annotation bounding boxes on data.
      // TODO -> add this to the backend payload and send it from client.
      const boundingBoxPerMaskAnnotationId = this.initBoundingBoxPerMaskAnnotationIdArray()

      this.annotationsIds = []
      this.annotationsMap = {}

      const rasterLayerStageAnnotations: StageAnnotation[] = []
      const stageAnnotations: StageAnnotation[] = []
      const maskAnnotations: StageAnnotation[] = []

      // Seperate out rasters, and make multiple annotations from these rasters
      storeAnnotations.forEach((stageAnnotation: StageAnnotation) => {
        if (this.isRasterLayerStageAnnotation(stageAnnotation)) {
          rasterLayerStageAnnotations.push(stageAnnotation)
        } else {
          stageAnnotations.push(stageAnnotation)

          if (this.isMaskStageAnnotation(stageAnnotation)) {
            maskAnnotations.push(stageAnnotation)
          }
        }
      })

      this.initialiseRasterIfNotYetInitialised(
        rasterLayerStageAnnotations,
        maskAnnotations,
        boundingBoxPerMaskAnnotationId
      )

      // First, put bounding boxes annotations first, otherwise creating
      // and initializing strings, graphs and tables fails
      sortedByTypeAnnotations = stageAnnotations
        .sort((a, b) => this.compareByBoundingBox(a, b))
        .map(p => Annotation.createFromDeserializable(this.view, p))
        .filter((n): n is Annotation => !!n)

      this.appendBoundingBoxToMaskAnnotations(
        sortedByTypeAnnotations,
        boundingBoxPerMaskAnnotationId
      )
    } else {
      // Old logic when RASTERS flag not enabled.
      this.resetState()
      this.annotationsIds = []
      this.annotationsMap = {}
      // First, put bounding boxes annotations first, otherwise creating
      // and initializing strings, graphs and tables fails
      sortedByTypeAnnotations = storeAnnotations
        .sort((a, b) => this.compareByBoundingBox(a, b))
        .map(p => Annotation.createFromDeserializable(this.view, p))
        .filter((n): n is Annotation => !!n)
    }

    sortedByTypeAnnotations.forEach(annotation => {
      annotation.initializeCachedAttributes()
      this._pushAnnotation(annotation)
    })

    this.sortByZIndex()
    this.emit('annotations:changed', this.annotations)
  }

  /**
   * TODO -> Video support: Right now this will just show up false for video
   */
  private isRasterLayerStageAnnotation (stageAnnotation: StageAnnotation): boolean {

    const imageDataPayload = <ImageDataPayload>stageAnnotation.data

    return imageDataPayload.raster_layer !== undefined
  }

  /**
   * TODO -> Video support: Right now this will just show up false for video
   */
  private isMaskStageAnnotation (stageAnnotation: StageAnnotation): boolean {
    const imageDataPayload = <ImageDataPayload>stageAnnotation.data

    return imageDataPayload.mask !== undefined
  }

  /**
   * If there are cached values of the mask segment bounding boxes
   * on the outdated client side mask annotations, collect these up per annotationId
   * and store them temporarily.
   */
  private initBoundingBoxPerMaskAnnotationIdArray (): Record<string, BoundingBoxData> {
    const boundingBoxPerMaskAnnotationId: Record<string, BoundingBoxData> = {}

    this.annotationsIds.forEach((annotationId: string) => {
      const annotation = this.annotationsMap[annotationId]

      if (annotation.isRasterAnnotation() && annotation.data.bounding_box) {
        boundingBoxPerMaskAnnotationId[annotationId] = annotation.data.bounding_box
      }
    })

    return boundingBoxPerMaskAnnotationId
  }

  /**
   * If a raster layer doesn't yet exist on the image, sets up the raster
   * and adds it to the RasterManager.
   *
   * @param rasterLayerStageAnnotations The `raster_layer` annotations for the stage
   * @param maskAnnotations An array of `mask` annotations for the stage.
   * @param boundingBoxPerMaskAnnotationId A container for the derived bounding
   * box information. If the raster layer is created for the first time, these are
   * derived during decoding.
   */
  private initialiseRasterIfNotYetInitialised (
    rasterLayerStageAnnotations: StageAnnotation[],
    maskAnnotations: StageAnnotation[],
    boundingBoxPerMaskAnnotationId: Record<string, BoundingBoxData>
  ): void {
    rasterLayerStageAnnotations.forEach(rasterLayerStageAnnotation => {
      const boundingBoxPerAnnotationId = createRasterFromDeserializable(
        this.view,
        rasterLayerStageAnnotation,
        maskAnnotations
      )

      Object.keys(boundingBoxPerAnnotationId).forEach((annotationId) => {
        boundingBoxPerMaskAnnotationId[annotationId] = boundingBoxPerAnnotationId[annotationId]
      })
    })
  }

  /**
   * Adds the derived bounding boxes from the raster layer to the `mask` annotations.
   *
   * @param maskAnnotations The Mask annotations to modify.
   * @param boundingBoxPerMaskAnnotationId A map of annotationIds to the BoundingBoxData
   * to add the corresponding annotations.
   */
  private appendBoundingBoxToMaskAnnotations (
    maskAnnotations: Annotation[],
    boundingBoxPerMaskAnnotationId: Record<string, BoundingBoxData>
  ): void {
    // If we have any raster stage annotations, use the derived bounding boxes
    // This happens on load, but not during initial creation.
    maskAnnotations.forEach((annotation: Annotation) => {
      if (
      // Only try to set these on the first pass, otherwise the
      // bounding boxes are updated via actions on the client.
        annotation.isRasterAnnotation() && annotation.data.bounding_box === undefined
      ) {
        const boundingBox = boundingBoxPerMaskAnnotationId[annotation.id]

        if (boundingBox === undefined) {
          throw new Error('No bounding box derived for mask annotation')
        }

        this.updateAnnotationData(annotation, {
          bounding_box: boundingBox,
          rasterId: annotation.data.rasterId
        })
      }
    })
  }

  protected compareByBoundingBox (a: StageAnnotation, b: StageAnnotation): number {
    const typeA = this.resolveAnnotationType(a)
    const typeB = this.resolveAnnotationType(b)
    if (!typeA || !typeB) { return 0 }

    if (typeA === BOUNDING_BOX_ANNOTATION_TYPE) { return -1 }
    if (typeB === BOUNDING_BOX_ANNOTATION_TYPE) { return 1 }
    return 0
  }

  public handleShowAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.show(false)
    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
    this.clearMemo()
  }

  public handleHideAnnotation (id: string): void {
    const annotation = this.getAnnotation(id)
    if (!annotation) { return }
    annotation.hide(false)
    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
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

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
    this.clearMemo()
  }

  public handleToggleAnnotations (): void {
    const renderAnnotations = this.view.store.state.workview.renderAnnotations
    this.annotations.forEach(annotation => {
      renderAnnotations ? annotation.show(false) : annotation.hide(false)
    })
    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
    this.clearMemo()
  }

  protected get currentStageInstance (): WorkflowStagePayload | null {
    return this.view.store.state.workview.selectedStageInstance
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

  protected sortByZIndex (): void {
    this.annotationsIds.sort((a, b) =>
      compareByZIndexCamelcase(
        this.getAnnotation(a) as Annotation,
        this.getAnnotation(b) as Annotation
      )
    )
  }

  public initializeSubAnnotation (
    type: AnnotationTypeName,
    parent: Annotation,
    data: AnnotationData
  ): Annotation | null {
    return Annotation.createSubAnnotation(this.view, { parent, data, type })
  }

  public updateAnnotationData (annotation: Annotation, data: AnnotationData): void {
    annotation.data = data
  }

  /**
   * Delegate to a store getter which infers the main annotation type of a class
   */
  public getMainAnnotationTypeForClass (aClass: AnnotationClass): AnnotationTypePayload {
    return this.view.store.getters['aclass/mainAnnotationTypeForClass'](aClass)
  }

  /**
   * Delegate to a store getter which infers the sub annotation types of a class
   */
  public getSubAnnotationTypesForClass (aClass: AnnotationClass): AnnotationType[] {
    return this.view.store.getters['aclass/subAnnotationTypesForClass'](aClass)
  }

  /**
   * Changes the class of the currently selected annotation, if allowed
   *
   * Class change can only happen if the new class is of the same main type as the old class
   */
  public maybeChangeSelectedAnnotationClass (newClass: AnnotationClass): boolean {
    const { selectedAnnotation } = this
    if (!selectedAnnotation) { return false }

    const currentClass = selectedAnnotation.annotationClass
    if (!currentClass || currentClass.id === newClass.id) { return false }

    const currentMainType = this.getMainAnnotationTypeForClass(currentClass)
    const newMainType = this.getMainAnnotationTypeForClass(newClass)

    if (newMainType.name === 'tag') { return false }
    if (currentMainType.name !== newMainType.name) { return false }

    this.view.actionManager.do(changeAnnotationClass(this, selectedAnnotation, newClass))
    return true
  }

  toggleAnnotations (): void {
    this.view.store.commit('workview/TOGGLE_ANNOTATIONS')
  }

  toggleSubAnnotations (): void {
    this.view.store.commit('workview/TOGGLE_SUBANNOTATIONS')
  }

  get showAnnotations (): boolean {
    // if (!this.embedded) { return true }
    return this.view.store.state.workview.renderAnnotations
  }

  get showSubAnnotations (): boolean {
    // if (!this.embedded) { return true }
    return this.view.store.state.workview.renderSubAnnotations
  }

  public resolveAnnotationType (stageAnnotation: StageAnnotation): AnnotationTypeName | null {
    const { mainAnnotationTypes } = this

    let data
    if ('frames' in stageAnnotation.data) {
      const frames: AnnotationData = Object.values(stageAnnotation.data.frames)
      if (frames.length === 0) { return null }
      data = frames[0]
    } else {
      data = stageAnnotation.data
    }

    const type = (Object.keys(data) as AnnotationTypeName[])
      .find(t => mainAnnotationTypes.includes(t))

    return type || null
  }

  /**
   * Ony one annotation can be selected
   */
  get selectedAnnotation (): Annotation | undefined {
    if (this.selectedAnnotationIds[0]) {
      return this.getAnnotation(this.selectedAnnotationIds[0])
    }
  }

  get mainAnnotations (): Annotation[] {
    return this.annotations.filter(annotation => annotation.parentId === undefined)
  }

  get visibleAnnotations (): Annotation[] {
    const { annotations, mainAnnotations } = this
    const { camera } = this.view
    const { currentTool } = this.view.toolManager

    const visibleAnnotations = annotations.filter(annotation => {
      if (!annotation.isVisible) { return false }

      if (annotation.type === STRING_ANNOTATION_TYPE) { return false }

      if (annotation.type !== LINK_ANNOTATION_TYPE) { return true }

      const { from, to } = getLinkAnnotationData(annotation, this.view)

      if (!from || !to) { return false }

      const fromAnnotation = mainAnnotations.find(a => a.id === from)
      const toAnnotation = mainAnnotations.find(a => a.id === to)

      if (!fromAnnotation || !toAnnotation) { return false }

      let { centroid: fromCentroid } = fromAnnotation
      let { centroid: toCentroid } = toAnnotation

      if (!fromCentroid) {
        const tempCentroid = calcCentroidPoint(this.view, fromAnnotation)
        if (!tempCentroid) { return false }
        fromCentroid = camera.canvasViewToImageView(tempCentroid)
      }

      if (!toCentroid) {
        const tempCentroid = calcCentroidPoint(this.view, toAnnotation)
        if (!tempCentroid) { return false }
        toCentroid = camera.canvasViewToImageView(tempCentroid)
      }

      return true
    })

    return currentTool && currentTool.tool.shouldRender
      ? visibleAnnotations.filter(annotation =>
        annotation.isVisible && currentTool.tool.shouldRender!(annotation)
      )
      : visibleAnnotations.filter(annotation => annotation.isVisible)
  }

  get visibleMainAnnotations (): Annotation[] {
    return this.visibleAnnotations.filter(annotation => annotation.parentId === undefined)
  }

  get visibleNonTagAnnotations (): Annotation[] {
    const tagClassIds = this.tagAnnotationClasses.map(a => a.id)
    return this.visibleMainAnnotations.filter((a) =>
      a.isVisible && !tagClassIds.includes(a.classId)
    )
  }

  get highlightedAnnotations (): Annotation[] {
    return this.visibleMainAnnotations.filter(annotation => annotation.isHighlighted)
  }

  get highlightedVertices (): EditableImagePoint[] {
    let vertices: EditableImagePoint[] = []
    for (const annotation of this.highlightedAnnotations) {
      const renderer = this.view.renderManager.rendererFor(annotation.type)
      if (!renderer || !('getAllVertices' in renderer)) { continue }

      if (!annotation.isVideoAnnotation()) {
        vertices = [
          ...vertices,
          ...renderer.getAllVertices(annotation, this.view).filter(v => v.isHighlighted)
        ]
        continue
      }

      const { data: annotationData } = annotation.inferVideoData(this.view)
      if (Object.keys(annotationData).length === 0) { continue }
      const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })
      vertices = [
        ...vertices,
        ...renderer.getAllVertices(actualAnnotation, this.view).filter(v => v.isHighlighted)
      ]
    }
    return vertices
  }

  public isVideoAnnotationAtPoint (annotation: VideoAnnotation, point: ImagePoint): boolean {
    const { path2D, type, isSelected } = annotation
    const renderer = this.view.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return false }

    const inferredVideoAnnotationData = annotation.inferVideoData(this.view)
    const { data: annotationData } = inferredVideoAnnotationData

    if (Object.keys(annotationData).length === 0) { return false }

    const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })

    if (type === 'line' || type === 'keypoint') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this.view),
        5 / this.view.cameraScale
      )
      const { path } = renderer.getPath(actualAnnotation, this.view)
      return isVertex || this.view.isPointOnPath(point, path)
    } else if (type === 'skeleton') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this.view),
        5 / this.view.cameraScale
      )
      if (
        !annotation.annotationClass ||
        !annotation.annotationClass.metadata.skeleton
      ) { return false }
      const { skeleton: { edges } } = annotation.annotationClass.metadata
      if (!isSkeleton(annotationData)) {
        throw new Error('editor: expected annotation of skeleton type')
      }
      const { nodes } = annotationData
      const paths = getEdgesAsPaths(nodes, edges)
      return isVertex || this.view.isPointOnPaths(point, paths)
    } else if (path2D) {
      // only check vertex if selected
      const isVertex = isSelected && pointIsVertexOfPath(
        point,
        renderer.getAllVertices(actualAnnotation, this.view),
        5 / this.view.cameraScale
      )
      return isVertex || this.view.isPointInPath2D(path2D, point)
    }

    const { path, additionalPaths } = renderer.getPath(actualAnnotation, this.view)
    return (
      this.view.isPointInPath(point, path) ||
      additionalPaths.some(p => this.view.isPointInPath(point, p))
    )
  }

  public isImageAnnotationAtPoint (annotation: ImageAnnotation, point: ImagePoint): boolean {
    const { path2D, type, isSelected } = annotation
    const renderer = this.view.renderManager.rendererFor(type)
    if (!renderer || !('getAllVertices' in renderer)) { return false }

    if (type === 'line' || type === 'keypoint' || type === 'link') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this.view),
        5 / this.view.cameraScale
      )
      const { path } = renderer.getPath(annotation, this.view)
      return isVertex || this.view.isPointOnPath(point, path)
    } else if (type === 'skeleton') {
      const isVertex = pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this.view),
        5 / this.view.cameraScale
      )
      if (
        !annotation.annotationClass ||
        !annotation.annotationClass.metadata.skeleton
      ) { return false }
      const { skeleton: { edges } } = annotation.annotationClass.metadata
      if (!isSkeleton(annotation.data)) {
        throw new Error('editor: expected annotation of skeleton type')
      }
      const { nodes } = annotation.data
      const paths = []
      for (const edge of edges) {
        const fromNode = nodes.find(node => node.name === edge.from)
        const toNode = nodes.find(node => node.name === edge.to)
        if (!fromNode || !toNode) { return false }
        paths.push([fromNode.point, toNode.point])
      }
      return isVertex || this.view.isPointOnPaths(point, paths)
    } else if (path2D) {
      // only check vertex if selected
      const isVertex = isSelected && pointIsVertexOfPath(
        point,
        renderer.getAllVertices(annotation, this.view),
        5 / this.view.cameraScale
      )
      return isVertex || this.view.isPointInPath2D(path2D, point)
    }

    const { path, additionalPaths } = renderer.getPath(annotation, this.view)
    return (
      this.view.isPointInPath(point, path) ||
      additionalPaths.some(p => this.view.isPointInPath(point, p))
    )
  }

  selectPreviousAnnotation (): Annotation | null {
    this.annotationMoving = undefined
    this.initialAnnotationData = undefined

    const { selectedAnnotation, visibleNonTagAnnotations: annotations } = this
    let previousAnnotation: Annotation | null = null

    if (annotations.length === 0) {
      previousAnnotation = null
    } else if (!selectedAnnotation) {
      previousAnnotation = annotations[annotations.length - 1]
    } else {
      const selectedIndex =
        annotations.findIndex(annotation => annotation.id === selectedAnnotation.id)

      if (selectedIndex <= 0) {
        previousAnnotation = annotations[annotations.length - 1]
      } else {
        previousAnnotation = annotations[selectedIndex - 1]
      }
    }

    if (previousAnnotation) {
      this.selectAnnotation(previousAnnotation.id)
    }
    return previousAnnotation
  }

  selectNextAnnotation (): Annotation | null {
    this.annotationMoving = undefined
    this.initialAnnotationData = undefined

    const { selectedAnnotation, visibleNonTagAnnotations: annotations } = this
    let nextAnnotation: Annotation | null = null

    if (annotations.length === 0) {
      nextAnnotation = null
    } else if (!selectedAnnotation) {
      nextAnnotation = annotations[0]
    } else {
      const selectedIndex = annotations.findIndex(annotation =>
        annotation.id === selectedAnnotation.id)

      if (selectedIndex === annotations.length - 1) {
        nextAnnotation = annotations[0]
      } else {
        nextAnnotation = annotations[selectedIndex + 1]
      }
    }

    if (nextAnnotation) {
      this.selectAnnotation(nextAnnotation.id)
    }
    return nextAnnotation
  }

  moveSelectedAnnotation (offset: ImagePoint): void {
    const { selectedAnnotation, selectedVertex } = this
    if (!selectedAnnotation) { return }

    this.annotationMoving =
      this.visibleMainAnnotations.find(a => a.id === selectedAnnotation.id)

    if (!this.annotationMoving) { return }

    if (!this.initialAnnotationData) {
      this.initialAnnotationData = cloneDeep(this.annotationMoving.data)
    }

    if (selectedVertex) {
      translateVertex(this.view.editor, selectedVertex, offset, {}, new MouseEvent('mock'))
    } else {
      translatePath(this.view.editor, this.annotationMoving, offset)
    }

    this.annotationMoving.path2D = undefined
    this.annotationMoving.centroid = undefined
    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
  }

  async performMoveAction (): Promise<void> {
    const { annotationMoving, initialAnnotationData } = this
    if (!annotationMoving || !initialAnnotationData) { return }

    const action = updateAnnotationData(
      this.view,
      annotationMoving,
      initialAnnotationData,
      annotationMoving.data
    )
    await this.view.actionManager.do(action)
  }

  inferVideoSubAnnotations (annotation: Annotation): Annotation[] {
    const emptySubAnnotations: Annotation[] = []
    const { sub_frames: subFrames = {}, segments } = annotation.data
    if (this.view.isLoading) { return emptySubAnnotations }
    if (!isVideoSubAnnotations(annotation.subAnnotations)) { return emptySubAnnotations }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.view.currentFrameIndex >= range[0] && this.view.currentFrameIndex <= range[1]
    )
    if (!range) { return emptySubAnnotations }

    const subAnnotationFrames = annotation.subAnnotations.frames
    const subkeyframe = subFrames && this.view.currentFrameIndex in subFrames

    // Find the closest keyframe to the left of the current index
    const prevSubIdx = subkeyframe
      ? this.view.currentFrameIndex
      : getPreviousFrameIndex(subFrames, this.view.currentFrameIndex)

    return prevSubIdx === null ? [] : subAnnotationFrames[prevSubIdx]
  }

  getVideoSubAnnotationData (annotation: Annotation): VideoSubAnnotationDataPayload {
    const emptyPayload: VideoSubAnnotationDataPayload = {
      subs: [],
      subkeyframe: false
    }
    const { sub_frames: subFrames, segments } = annotation.data
    if (this.view.isLoading) { return emptyPayload }
    if (!isVideoSubAnnotations(annotation.subAnnotations)) { return emptyPayload }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.view.currentFrameIndex >= range[0] && this.view.currentFrameIndex <= range[1]
    )
    if (!range) { return emptyPayload }

    if (subFrames && this.view.currentFrameIndex in subFrames) {
      return {
        subs: annotation.subAnnotations.frames[this.view.currentFrameIndex] || [],
        subkeyframe: true
      }
    }

    return emptyPayload
  }

  inferVideoAnnotationDataOnly (
    annotationData: AnnotationData,
    annotationType: string
  ): AnnotationData {
    const {
      frames,
      sub_frames: subFrames,
      segments,
      interpolate_algorithm: algorithm,
      interpolated
    } = annotationData
    if (this.view.isLoading) { return {} }

    // Figure out if the video annotation is visible
    const range = segments?.find(
      (range: [number, number]) =>
        this.view.currentFrameIndex >= range[0] && this.view.currentFrameIndex <= range[1]
    )
    if (!range) { return {} }

    // See if the data is present in a keyframe
    if (this.view.currentFrameIndex in frames) {
      return frames[this.view.currentFrameIndex]
    }

    if (subFrames && this.view.currentFrameIndex in subFrames) {
      return subFrames[this.view.currentFrameIndex]
    }

    // Find the closest keyframe to the left of the current index
    // and the closest keyframe to the right of the current index
    let prev: [number, any] | null = null
    let next: [number, any] | null = null
    for (const entry of Object.entries(frames)) {
      const frameIndex = parseInt(entry[0])
      if (frameIndex < this.view.currentFrameIndex) {
        if (!prev || (prev && frameIndex > prev[0])) {
          prev = [frameIndex, entry[1]]
        }
      } else if (frameIndex > this.view.currentFrameIndex) {
        if (!next || (next && frameIndex < next[0])) {
          next = [frameIndex, entry[1]]
        }
      }
    }

    if (prev === null && next !== null) { return next[1] }

    if (prev !== null && next === null) { return prev[1] }

    if (next !== null && prev !== null) {
      const renderer = this.view.renderManager.rendererFor(annotationType)
      if (!supportsInterpolation(renderer) || !interpolated) { return prev[1] }

      const interpolationFactor = (this.view.currentFrameIndex - prev[0]) / (next[0] - prev[0])
      const params: LinearInterpolationParams = {
        algorithm,
        interpolationFactor
      }

      return renderer.interpolate(prev[1], next[1], params)
    }

    return {}
  }

  inferVideoSubAnnotationDataOnly (annotationData: AnnotationData): AnnotationData {
    const { sub_frames: subFrames = {}, segments } = annotationData
    if (this.view.isLoading) { return {} }

    // Figure out if the video annotation is visible
    const range =
      segments?.find(
        (range: [number, number]) =>
          this.view.currentFrameIndex >= range[0] && this.view.currentFrameIndex <= range[1]
      )
    if (!range) { return {} }

    const subkeyframe = subFrames && this.view.currentFrameIndex in subFrames
    const prevSubIdx = subkeyframe
      ? this.view.currentFrameIndex
      : getPreviousFrameIndex(subFrames, this.view.currentFrameIndex)

    return prevSubIdx === null ? {} : subFrames[prevSubIdx]
  }

  preselectedAnnotationClassColor (alpha: number = 1.0): string {
    alpha = clamp(alpha, 0, 1)

    const { preselectedAnnotationClass } = this
    if (!preselectedAnnotationClass) {
      return rgbaString({ r: 94, g: 235, b: 220, a: 1.0 }, alpha)
    }

    const { color } = preselectedAnnotationClass
    return rgbaString(color, alpha)
  }

  selectedAnnotationClassColor (alpha: number = 1.0): string {
    alpha = clamp(alpha, 0, 1)

    const { selectedAnnotation } = this
    if (!selectedAnnotation) {
      return rgbaString({ r: 227, g: 234, b: 242, a: 1.0 }, alpha)
    }

    const { color } = selectedAnnotation
    return rgbaString(color, alpha)
  }

  public setAnnotationClasses (classes: AnnotationClassPayload[]): void {
    this.annotationClasses = classes.map(p => new AnnotationClass(p))
    this.setSubAnnotationTypesForClasses(this.annotationClasses)
  }

  addAnnotationClass (annotationClass: AnnotationClass): void {
    this.annotationClasses.push(annotationClass)
    this.addSubAnnotationTypesForClass(annotationClass)
  }

  addSubAnnotationTypesForClass (annotationClass: AnnotationClass): void {
    this.subAnnotationsTypesForClasses.set(
      annotationClass.id,
      this.getSubAnnotationTypesForClass(annotationClass)
    )
  }

  // Invalidates any cached data such as path2d or centroid for all annotations
  public invalidateAnnotationCache (): void {
    this.annotations.forEach(annotation => {
      annotation.path2D = undefined
      annotation.centroid = undefined
    })
  }

  private setSubAnnotationTypesForClasses (annotationClasses: AnnotationClass[]): void {
    this.subAnnotationsTypesForClasses.clear()
    annotationClasses.forEach(aclass => {
      this.subAnnotationsTypesForClasses.set(
        aclass.id, this.getSubAnnotationTypesForClass(aclass)
      )
    })
  }

  get selectedVertex (): EditableImagePoint | undefined {
    const { selectedAnnotation } = this
    if (!selectedAnnotation) { return }

    const renderer = this.view.renderManager.rendererFor(selectedAnnotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return }

    const vertices = renderer.getAllVertices(selectedAnnotation, this.view)
    return vertices.find(vertex => vertex.isSelected)
  }

  public get preselectedAnnotationClass (): AnnotationClass | null {
    const { store: { state } } = this.view
    const { annotationClasses } = this
    const { preselectedAnnotationClassId } = state.workview

    return annotationClasses.find(c => c.id === preselectedAnnotationClassId) || null
  }

  get tagAnnotationClasses (): AnnotationClass[] {
    return this.annotationClasses.filter(c => c.annotation_types.includes('tag'))
  }

  get nonTagAnnotations (): (Annotation & { annotationClass: AnnotationClass })[] {
    const tagClassIds = this.tagAnnotationClasses.map(a => a.id)
    return this.annotations.filter(
      (a): a is Annotation & { annotationClass: AnnotationClass } =>
        !!a.annotationClass && !tagClassIds.includes(a.annotationClass.id)
    )
  }

  /**
   * Returns a promise resolves into an annotation class compatible with the specified type
   *
   * If the preselected class is compatible, it will be returned.
   * If not, the user will be shown a class selection dialog.
   *
   * If the user cancels the selection, the promise will resolve to `null`
   */
  async resolveAnnotationClass (typeName: AnnotationTypeName): Promise<AnnotationClass | null> {
    const { preselectedAnnotationClass } = this

    if (preselectedAnnotationClass) {
      const type = this.getMainAnnotationTypeForClass(preselectedAnnotationClass)
      if (type.name === typeName) {
        return preselectedAnnotationClass
      }
    }

    try {
      return await this.view.editor.classDialog.requestUserSelectClass(typeName)
    } catch {
      return null
    }
  }

  /**
   * Instantiates fully "filled in" annotation which is ready to be saved to
   * the backend.
   *
   * Use this function when an annotation is needed, to be passed into a custom
   * action to save it.
   *
   * This consists of
   *
   * - checking all the required data is loaded
   * - resolving actors for the annotation
   * - resolving the class by taking the preselected class, or having the user select a class
   * - resolving full annotation data
   */
  public async prepareAnnotationForCreation (
    params: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >,
    subAnnotationParams?: any
  ): Promise<Annotation | void> {
    const { isProcessedAsVideo } = this.view.fileManager

    let annotationClass: AnnotationClass | null = null
    let classId: number
    if (params.classId) {
      this.view.store.commit('workview/PRESELECT_CLASS_ID', params.classId)
      classId = params.classId
    } else {
      annotationClass = await this.resolveAnnotationClass(params.type)
      if (!annotationClass) { return }

      this.view.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
      classId = annotationClass.id
    }

    if (isProcessedAsVideo) {
      const data = params.data as VideoAnnotationData
      data.interpolate_algorithm = 'linear-1.1'
      data.segments = buildInitialSegments(this.view.currentFrameIndex)
      params.data = data
    }

    // this.store.state.user.profile.
    const currentUser = this.view.store.state.user.profile

    if (!currentUser) {
      throw new Error('unrecognized team member')
    }

    const actorPayload: AnnotationActorPayload = {
      role: 'annotator',
      user_id: currentUser.id
    }

    let annotation

    if (FeatureFlagsManager.isOnRasters) {
      if (annotationClass?.annotation_types.includes('mask') && params.type === 'polygon') {
        annotation = await drawPolygonToRaster(this.view, params?.data, annotationClass.id)
      } else {
        annotation = Annotation.createFromInstanceParams(this.view, {
          id: params.id,
          actors: [actorPayload],
          type: params.type,
          classId: classId,
          data: params.data,
          zIndex: this.view.annotationManager.getMaxZIndex(this.annotations) + 1,
          isSelected: params.isSelected
        })
      }
    } else {
      annotation = Annotation.createFromInstanceParams(this.view, {
        id: params.id,
        actors: [actorPayload],
        type: params.type,
        classId: classId,
        data: params.data,
        zIndex: this.view.annotationManager.getMaxZIndex(this.annotations) + 1,
        isSelected: params.isSelected
      })
    }

    if (!annotation) { return }

    if (!annotationClass) { return annotation }
    // subAnnotations is always default SubAnnotation when creating a new annotation
    const subAnnotations = annotation.subAnnotations as ImageSubAnnotation[]
    for (const subAnnotationType of this.getSubAnnotationTypesForClass(annotationClass)) {
      const serializer = <AnnotationTypeSerializer<AnnotationData> | undefined>
        this.view.editor.serializerManager.getSerializer(subAnnotationType.name)
      if (!serializer || !serializer.defaultData) { continue }

      const data = serializer.defaultData(subAnnotationParams)
      if (!data) { continue }
      const subAnnotation = this.initializeSubAnnotation(subAnnotationType.name, annotation, data)
      if (!subAnnotation) { continue }
      subAnnotations.push(subAnnotation)
    }

    return annotation
  }

  public updateAnnotationSubs (
    annotation: Annotation,
    videoSubs: VideoSubAnnotations
  ): void {
    annotation.subAnnotations = videoSubs
  }

  public updateAnnotationFrame (
    annotation: Annotation,
    frame: AnnotationData,
    subs: Annotation[],
    index: number
  ): void {
    if (!annotation.isVideoAnnotation()) { return }

    const { frames: dataFrames } = annotation.data
    const { frames: subsFrames } = annotation.subAnnotations
    if (dataFrames === undefined || subsFrames === undefined) { return }

    const updatedDataFrames = { ...dataFrames, [index]: frame }
    this.updateAnnotationData(annotation, { ...annotation.data, frames: updatedDataFrames })
    this.updateAnnotationSubs(annotation, { ...annotation.subAnnotations })
  }

  get selectedAnnotationVertices (): EditableImagePoint[] {
    const selectedAnnotation = this.annotations.find(annotation => annotation.isSelected)
    if (!selectedAnnotation) { return [] }

    const renderer = this.view.renderManager.rendererFor(selectedAnnotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return [] }

    return renderer.getAllVertices(selectedAnnotation, this.view)
  }

  selectPreviousVertex (): void {
    const { selectedAnnotationVertices: vertices } = this
    const selectedIndex = vertices.findIndex(vertex => vertex.isSelected)

    if (selectedIndex >= 0) {
      vertices[selectedIndex].isSelected = false
    }

    const vertexIndex = selectedIndex <= 0 ? vertices.length - 1 : selectedIndex - 1
    vertices[vertexIndex].isSelected = true

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
  }

  selectNextVertex (): void {
    const { selectedAnnotationVertices: vertices } = this
    const selectedIndex = vertices.findIndex(vertex => vertex.isSelected)

    if (selectedIndex >= 0) {
      vertices[selectedIndex].isSelected = false
    }

    const vertexIndex = selectedIndex === vertices.length - 1 ? 0 : selectedIndex + 1
    vertices[vertexIndex].isSelected = true

    if (FeatureFlagsManager.isOffLayerV2) {
      this.view.annotationsLayer.changed()
    }
  }

  async createAnnotations (
    paramsList: Pick<
      CreateAnnotationParams,
      'id' | 'classId' | 'type' | 'data' | 'isSelected'
    >[],
    actionGroup?: ActionGroup,
    subAnnotationParamsList?: any[]
  ): Promise<Annotation[] | undefined> {
    const annotations = []
    for (let i = 0; i < paramsList.length; i++) {
      const params = paramsList[i]
      const subAnnotationParams = subAnnotationParamsList && subAnnotationParamsList[i]
        ? subAnnotationParamsList[i]
        : undefined

      const annotation = await this.prepareAnnotationForCreation(params, subAnnotationParams)
      if (!annotation) { return }

      annotations.push(annotation)
    }

    const actor = actionGroup || this.view.actionManager
    await actor.do(addAnnotationsAction(this.view, annotations))

    return annotations
  }

  get mainAnnotationTypes (): AnnotationTypeName[] {
    return Array.from(this.annotationTypes.keys())
  }

  get subAnnotationTypes (): AnnotationTypeName[] {
    const subs: Set<AnnotationTypeName> = new Set()
    for (const subAnnotationTypes of this.annotationTypes.values()) {
      for (const sub of subAnnotationTypes) {
        subs.add(sub)
      }
    }
    return Array.from(subs.values())
  }

  /**
   * Returns a mapping of main annotation type to it's sub types for every class in the editor
   *
   * Example
   * ```
   * {
   *   polygon: ['directional_vector', 'auto_annotate'],
   *   bounding_box: ['text', 'attributes']
   * }
   * ```
   */
  get annotationTypes (): Map<AnnotationTypeName, AnnotationTypeName[]> {
    const annotationTypes: Map<AnnotationTypeName, AnnotationTypeName[]> = new Map()
    for (const annotationType of this.view.store.state.aclass.types) {
      if (!annotationTypes.has(annotationType.name) && annotationType.granularity === 'main') {
        const subs = annotationType.subs.map(ann => ann.name)
        annotationTypes.set(annotationType.name, subs)
      }
    }

    return annotationTypes
  }

  findTopAnnotationAt (
    point: ImagePoint,
    filter?: (annotation: Annotation) => boolean
  ): Annotation | undefined {
    const visibleMainAnnotations = filter
      ? this.visibleMainAnnotations.filter(filter)
      : this.visibleMainAnnotations

    return visibleMainAnnotations
      .sort(compareByZIndexCamelcase)
      .find(annotation => {
        if (annotation.isImageAnnotation()) {
          return this.isImageAnnotationAtPoint(annotation, point)
        }

        if (annotation.isVideoAnnotation()) {
          return this.isVideoAnnotationAtPoint(annotation, point)
        }

        return false
      })
  }

  /**
   * Instantiates basic annotation from given params, not resolving any data internally
   */
  public initializeAnnotation (
    params: Pick<CreateAnnotationParams, 'actors' | 'id' | 'type' | 'data' | 'classId'>
  ): Annotation | null {
    const { currentItem } = this.view.itemManager
    const { annotations } = this
    if (!currentItem) {
      throw new Error('Cannot initialize annotation. No item set')
    }

    return Annotation.createFromInstanceParams(this.view, {
      ...params,
      id: params.id,
      classId: params.classId,
      data: params.data,
      type: params.type,
      zIndex:
        params.type === 'tag'
          ? null
          : annotations[0] && annotations[0].zIndex !== null ? annotations[0].zIndex + 1 : 1
    })
  }

  /**
   * @deprecated
   * Finds the annotation vertex that matches the position of a given point with
   * a given threshold.
   *
   * All the highlighted annotations will be looped over until a match is found.
   *
   * @param point The position the vertex needs to match
   * @param threshold The position tolerance between the potential vertex and given point
   */
  public findAnnotationVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    return this.findAnnotationWithVertexAt(point, threshold)?.vertex
  }

  /**
   * Finds the annotation vertex that matches the position of a given point with
   * a given threshold.
   *
   * All the highlighted annotations will be looped over until a match is found.
   *
   * @param point The position the vertex needs to match
   * @param threshold The position tolerance between the potential vertex and given point
   *
   * Returns matched annotation with vertex
   */
  public findAnnotationWithVertexAt (
    point: ImagePoint,
    threshold?: number
  ): {
    vertex: EditableImagePoint,
    annotation: Annotation
  } | undefined {
    if (FeatureFlagsManager.isOnLayerV2) {
      for (
        const annotationId of [...this.highlightedAnnotationIds, ...this.selectedAnnotationIds]
      ) {
        const annotation = this.getAnnotation(annotationId)
        if (!annotation) { return }
        const vertex = this.doFindAnnotationVertexAt(annotation, point, threshold)
        if (!vertex) { continue }
        return {
          vertex,
          annotation
        }
      }
    } else {
      for (const annotation of this.highlightedAnnotations) {
        const vertex = this.doFindAnnotationVertexAt(annotation, point, threshold)
        if (!vertex) { continue }
        return {
          vertex,
          annotation
        }
      }
    }
  }

  private doFindAnnotationVertexAt (
    annotation: Annotation,
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    const renderer = this.view.renderManager.rendererFor(annotation.type)
    if (!isMainAnnotationTypeRenderer(renderer)) { return }

    if (!annotation.isVideoAnnotation()) {
      const path = renderer.getAllVertices(annotation, this.view)
      return this.view.findVertexAtPath([path], point, threshold)
    }
    const inferredVideoAnnotationData = annotation.inferVideoData(this.view)
    const { data: annotationData } = inferredVideoAnnotationData
    if (Object.keys(annotationData).length === 0) { return }

    const actualAnnotation: Annotation = annotation.shallowClone({ data: annotationData })
    const path = renderer.getAllVertices(actualAnnotation, this.view)
    return this.view.findVertexAtPath([path], point, threshold)
  }

  unhighlightAllVerticesInPath (paths: EditableImagePoint[][]): void {
    for (const path of paths) {
      for (const vertex of path) { vertex.isHighlighted = false }
    }
  }

  unhighlightAllAnnotationsVertices (): void {
    this.highlightedVertices.forEach(vertex => { vertex.isHighlighted = false })
  }

  deselectAllVerticesInPath (paths: EditableImagePoint[][]): void {
    for (const path of paths) {
      for (const vertex of path) { vertex.isSelected = false }
    }
  }

  deselectAllAnnotationsVertices (): void {
    const paths: EditableImagePoint[][] = this.visibleMainAnnotations
      .map(annotation => {
        const renderer = this.view.renderManager.rendererFor(annotation.type)
        if (renderer && 'getAllVertices' in renderer) {
          if (!annotation.isVideoAnnotation()) {
            return renderer.getAllVertices(annotation, this.view)
          }
          const { data: videoData } = annotation.inferVideoData(this.view)
          if (Object.keys(videoData).length === 0) { return [] }
          const actualAnnotation: Annotation = annotation.shallowClone({ data: videoData })
          return renderer.getAllVertices(actualAnnotation, this.view)
        }
        return []
      })

    this.deselectAllVerticesInPath(paths)
  }

  // START: Cleanup

  private resetState (): void {
    this.clearMemo()
    if (FeatureFlagsManager.isOnLayerV2) {
      this.cachedDeselectAllAnnotations()
      this.cachedUnhighlightAllAnnotations()
    } else {
      this.selectedAnnotationIds = []
      this.highlightedAnnotationIds = []
    }
  }

  /**
   * Clear all memos.
   *
   * Next call of memo getter will re-fill memo object.
   */
  private clearMemo (): void {
    this.memoGetAnnotations = {
      key: '',
      result: []
    }
    this.memoGetTagAnnotations = {
      key: '',
      result: []
    }
    this.memoGetFrameAnnotations = {
      key: '',
      result: []
    }
  }

  public cleanup (): void {
    this.annotations.forEach(a => a.clear())
    this.annotationsIds = []
    this.annotationsMap = {}
    this.resetState()
  }

  // END: Cleanup

  private emitError (): void {
    this.emit('annotation:error')
  }
}
