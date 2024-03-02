import { cloneDeep, omit, pick } from 'lodash'
import md5 from 'md5'
import { v4 as uuidv4 } from 'uuid'

import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { InferenceResult } from '@/engineCommon/backend'
import { EditableImagePoint, EditablePoint, Point } from '@/engineCommon/point'
import { enableInterpolateByDefault } from '@/engineV2/managers/renderManager'
import {
  AnnotationTypeSerializer,
  RasterTypeSerializer
} from '@/engineV2/managers/serializerManager'
import { AnnotationTypeRenderer, MainAnnotationTypeRenderer, Raster } from '@/engineV2/models'
import { BoundingBox } from '@/engineV2/plugins/boundingBox/types'
import { String, StringSource } from '@/engineV2/plugins/field/types'
import { Polygon } from '@/engineV2/plugins/polygon/types'
import { Table } from '@/engineV2/plugins/table/types'
import { Text } from '@/engineV2/plugins/text/types'
import { VideoAnnotationDataPayload } from '@/engineV2/types'
import { BBox, getBBox, getOriginBBox } from '@/engineV2/utils'
import {
  getInitialVideoAnnotationSegments
} from '@/engineV2/utils/getInitialVideoAnnotationSegments'
import {
  InterpolationAlgorithm,
  LinearInterpolationParams
} from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationActorPayload,
  AnnotationTypeName,
  ImageDataPayload,
  StageAnnotationPayload,
  StageType,
  TrainedModelPayload,
  VideoDataPayload
} from '@/store/types'
import { getRGBAColorHash, RGBA } from '@/utils'

import {
  AnnotationData,
  AutoAnnotateData,
  NormalizedInferenceData,
  SubAnnotationData,
  VideoAnnotationData
} from './AnnotationData'

const buildCumulativeBox = (sources: StringSource[], view: View): BoundingBox => {
  const topLeft: EditableImagePoint = new EditablePoint({
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  })
  const bottomLeft: EditableImagePoint = new EditablePoint({
    x: Number.POSITIVE_INFINITY,
    y: Number.NEGATIVE_INFINITY
  })
  const topRight: EditableImagePoint = new EditablePoint({
    x: Number.NEGATIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  })
  const bottomRight: EditableImagePoint = new EditablePoint({
    x: Number.NEGATIVE_INFINITY,
    y: Number.NEGATIVE_INFINITY
  })

  for (const source of sources) {
    const sourceAnnotation = view.annotationManager.mainAnnotations.find(a => a.id === source.id)
    if (!sourceAnnotation) { continue }

    const data: AnnotationData = sourceAnnotation.isVideoAnnotation()
      ? sourceAnnotation.inferVideoData(view).data
      : sourceAnnotation.data

    const path = [data.topLeft, data.topRight, data.bottomRight, data.bottomLeft]
    for (const point of path) {
      topLeft.x = Math.min(topLeft.x, point.x)
      topLeft.y = Math.min(topLeft.y, point.y)
      bottomLeft.x = Math.min(bottomLeft.x, point.x)
      bottomLeft.y = Math.max(bottomLeft.y, point.y)
      topRight.x = Math.max(topRight.x, point.x)
      topRight.y = Math.min(topRight.y, point.y)
      bottomRight.x = Math.max(bottomRight.x, point.x)
      bottomRight.y = Math.max(bottomRight.y, point.y)
    }
  }
  return { topLeft, topRight, bottomRight, bottomLeft }
}

export type SubAnnotationPayload = {
  parent: Annotation,
  data: AnnotationData | VideoAnnotationData,
  type: AnnotationTypeName
}

export type CreateAnnotationParams = {
  id?: string
  classId?: number
  data: AnnotationData | VideoAnnotationData,
  actors: AnnotationActorPayload[]
  subAnnotations?: Annotation[]
  workflowStageId?: number
  iouMatches?: StageAnnotation['iou_matches']

  isHighlighted?: boolean
  isSelected?: boolean
  isVisible?: boolean
  type: AnnotationTypeName
  /**
   * Determines draw order.
   *
   * Set to null when creating a tag.
   */
  zIndex: number | null
}

const DEFAULT_FLAGS = {
  isHighlighted: false,
  isSelected: true,
  isVisible: true
}

export type ImageSubAnnotation = Annotation & { data: SubAnnotationData }
export type VideoSubAnnotations = { frames: VideoSubAnnotationData }
export type VideoSubAnnotationData = { [frame: string]: Annotation[] }

type StageAnnotationWithOptionalStageId =
  // eslint-disable-next-line camelcase
  Omit<StageAnnotation, 'workflow_stage_id'> & { workflow_stage_id?: number }

export const isVideoAnnotationData = (
  data: AnnotationData | VideoAnnotationData
): data is VideoAnnotationData =>
  'frames' in data && 'segments' in data

export const isMaskAnnotationData = (data: AnnotationData | VideoAnnotationData): boolean => {
  if (isVideoAnnotationData(data)) {
    // Check if any frame has the rasterId
    return Object.keys(data.frames).some(
      (frameId: string) => data.frames[frameId].rasterId !== undefined
    )
  } else {
    return data.rasterId !== undefined
  }
}

export const isVideoAnnotationDataPayload = (
  data: StageAnnotationPayload['data']
): data is VideoDataPayload => 'frames' in data && 'segments' in data

export const isImageAnnotationDataPayload = (
  data: StageAnnotationPayload['data']
): data is ImageDataPayload => !isVideoAnnotationDataPayload(data)

export const isVideoSubAnnotations = (
  subAnnotations: ImageSubAnnotation[] | VideoSubAnnotations
): subAnnotations is VideoSubAnnotations =>
  'frames' in subAnnotations

export const isImageSubAnnotations = (
  subAnnotations: ImageSubAnnotation[] | VideoSubAnnotations
): subAnnotations is ImageSubAnnotation[] =>
  !isVideoSubAnnotations(subAnnotations)

export const isVideoAnnotation = (annotation: Annotation): annotation is VideoAnnotation =>
  isVideoAnnotationData(annotation.data) && isVideoSubAnnotations(annotation.subAnnotations)

export const isImageAnnotation = (annotation: Annotation): annotation is ImageAnnotation =>
  !isVideoAnnotationData(annotation.data) && !isVideoSubAnnotations(annotation.subAnnotations)

export const isRasterAnnotation = (annotation: Annotation): annotation is MaskAnnotation =>
  isMaskAnnotationData(annotation.data)

type NormalizedSubAnnotation = { type: AnnotationTypeName, data: AnnotationData | null }

/**
 * Builds the initial value for the `segments` field of a video annotation.
 * This value is equal to [[currentFrameIndex, currentFrameIndex]].
 *
 * It should not be stored to backend. Rathern, when serializing annotation, we
 * should call `isInitialSegments` to check if we are using the initial value,
 * and replace it with the final value.
 *
 * We place both functions here, to centralize the logic behind it, but this is
 * a partial solution to the issue. Video annotations should be instead
 * instantiated differently, where this sort of "live patching" is not needed.
 */
export const buildInitialSegments =
  (frameIndex: number): VideoAnnotationData['segments'] => [[frameIndex, frameIndex]]

export class Annotation {
  public readonly view: View

  id!: string
  /** type determines how an annotation is serialized,deserialized and rendered */
  type!: AnnotationTypeName;

  /** parentId is used to point to the parent internal id */
  parentId?: string;

  /**
   * subAnnotations is used to store the annotations with sub granularity
   * related to the annotation
   */
  subAnnotations!: VideoSubAnnotations | ImageSubAnnotation[];

  /** classId maps to an AnnotationClass */
  classId!: number;

  actors!: AnnotationActorPayload[]

  /** Only one annotation class can be selected at any given time */
  private _isSelected!: boolean;
  /** Several annotations can be highlited at the same time */
  private _isHighlighted!: boolean;
  /** Should the annotation be visible */
  private _isVisible!: boolean;

  /**
   * stores boundingbox/polygon/directional vector or anything else useful for
   * a specific annotation type
   */
  data!: AnnotationData | NormalizedInferenceData | VideoAnnotationData;

  /**
   * Specifies draw/selection order
   *
   * Null if the annotation is a tag
   */
  zIndex!: number | null

  workflowStageId?: number

  iouMatches?: StageAnnotation['iou_matches']

  /**
   * The path drawn on the canvas, in image coordinates.
   */
  path2D?: Path2D

  boundingBox?: BoundingBox

  text?: string

  /**
   * Centroid of the annotation
   * used for caching purposes and should not be accessed directly
   */
  centroid?: Point<'Image'>

  private _annotationClass?: AnnotationClass

  /**
   * For the current class id, returns the appropriate class as an instance of
   * `AnnotationClass`.
   *
   * We use the store's `classesById` for lookup. While it's about the same as
   * using `view.annotationClasses.find(...)`, it actually gets noticeably faster
   * on a higher class count.
   */
  get annotationClass (): AnnotationClass | undefined {
    if (!this._annotationClass) {
      const payload = this.view.store.state.aclass.classesById[this.classId]
      if (payload) { this._annotationClass = new AnnotationClass(payload) }
    }
    return this._annotationClass
  }

  set annotationClass (annotationClass: AnnotationClass | undefined) {
    if (annotationClass) { this.classId = annotationClass.id }
  }

  get isSelected (): boolean { return this._isSelected }
  get isHighlighted (): boolean { return this._isHighlighted }
  get isVisible (): boolean { return this._isVisible }

  get label (): string {
    if (this.annotationClass) {
      return this.annotationClass.displayName
    }

    if ('label' in this.data) {
      return this.data.label
    }

    // Probably shouldn't happen.
    // Either there will be a class (image, video annotation), or there will
    // be a label on the data itself, from inference result.
    // This might be reachable in very remote edge cases, where, somehow,
    // the class is still loading, but not otherwise.
    return 'unknown'
  }

  get color (): RGBA {
    return this.annotationClass
      ? this.annotationClass.color
      : getRGBAColorHash(this.label)
  }

  /**
   * Static method to initialize the Annotation instance from payload from the backend
   * @param editor Editor who will own this annotation
   * @param payload Annotation Payload with Renderable Data
   */
  public static createFromDeserializable (
    view: View,
    payload: StageAnnotation
  ): Annotation | null {
    try {
      return new Annotation(view, { payload })
    } catch (err: unknown) {
      console.warn(err)
      return null
    }
  }

  /**
   * Static method to initialize Sub Annotation with its parent
   * @param view View who will own this annotation
   * @param subAnnotationPayload Payload to create a new annotation
   * @param subAnnotationPayload.parent Parent annotation
   * @param subAnnotationPayload.data Sub Annotation data
   * @param subAnnotationPayload.type Sub Annotation type
   */
  public static createSubAnnotation (
    view: View,
    subAnnotationPayload: SubAnnotationPayload
  ): Annotation | null {
    try {
      return new Annotation(view, { subAnnotationPayload })
    } catch (err: unknown) {
      console.warn(err)
      return null
    }
  }

  /**
   * Static method to initialize the instance from Annotation properties
   * @param view View who will own this annotation
   * @param instanceParams Instance params
   */
  public static createFromInstanceParams (
    view: View,
    instanceParams: CreateAnnotationParams
  ): Annotation | null {
    try {
      return new Annotation(view, { instanceParams })
    } catch (err: unknown) {
      console.warn(err)
      return null
    }
  }

  /**
   * Static method to initialize the instace with inference data
   * @param View View who will own this annotation
   * @param inferenceData Inference data
   */
  public static createFromInferenceData (
    view: View,
    inferenceData: InferenceResult,
    inferenceClasses: TrainedModelPayload['classes']
  ): Annotation | null {
    try {
      return new Annotation(view, { inferenceData, inferenceClasses })
    } catch (err: unknown) {
      console.warn(err)
      return null
    }
  }

  constructor (
    view: View,
    params: {
      annotation?: Annotation,
      cloneParams?: Partial<CreateAnnotationParams>,
      inferenceClasses?: TrainedModelPayload['classes']
      inferenceData?: InferenceResult
      instanceParams?: CreateAnnotationParams,
      payload?: StageAnnotation,
      shallowClone?: boolean,
      subAnnotationPayload?: SubAnnotationPayload,
    }
  ) {
    this.view = view

    const {
      annotation,
      cloneParams,
      inferenceClasses,
      inferenceData,
      instanceParams,
      payload,
      subAnnotationPayload
    } = params

    if (payload) {
      this.constructFromPayload(payload)
    }

    if (subAnnotationPayload) {
      this.constructSubAnnotation(subAnnotationPayload)
    }

    if (inferenceData && inferenceClasses) {
      this.constructFromInferenceData(inferenceData, inferenceClasses)
    }

    if (instanceParams) {
      this.constructFromParams(instanceParams)
    }

    if (annotation) {
      if (params.shallowClone) {
        this.shallowCloneInstance(annotation, cloneParams)
      } else {
        this.cloneInstance(annotation, cloneParams)
      }
    }
  }

  public initializeCachedAttributes (): void {
    this.initializeBoundingBox()
    this.initializeCentroid()
    this.initializeText()
  }

  private initializeBoundingBox (): void {
    const supportedTypes = ['bounding_box', 'string', 'table']
    if (!supportedTypes.includes(this.type)) { return }

    const data: AnnotationData = this.isVideoAnnotation()
      ? this.inferVideoData(this.view).data
      : this.data

    if (Object.keys(data).length === 0) { return }

    if (this.type === 'bounding_box') {
      this.boundingBox = data as BoundingBox
    } else if (this.type === 'string') {
      const stringData = data as String
      this.boundingBox = buildCumulativeBox(stringData.sources, this.view)
    } else {
      const tableData = data as Table
      this.boundingBox = {
        topLeft: new EditablePoint({
          x: tableData.boundingBox.x,
          y: tableData.boundingBox.y
        }),
        topRight: new EditablePoint({
          x: tableData.boundingBox.x + tableData.boundingBox.w,
          y: tableData.boundingBox.y
        }),
        bottomRight: new EditablePoint({
          x: tableData.boundingBox.x + tableData.boundingBox.w,
          y: tableData.boundingBox.y + tableData.boundingBox.h
        }),
        bottomLeft: new EditablePoint({
          x: tableData.boundingBox.x,
          y: tableData.boundingBox.y + tableData.boundingBox.h
        })
      }
    }
  }

  private initializeCentroid (): void {
    if (!this.boundingBox) { return }
    const { topLeft, bottomRight } = this.boundingBox
    this.centroid = topLeft.add(bottomRight).div(2)
  }

  private initializeText (): void {
    const supportedTypes = ['bounding_box', 'string']
    if (!supportedTypes.includes(this.type)) { return }

    if (this.type === 'bounding_box') {
      if (this.isVideoAnnotation()) {
        const { subs } = this.inferVideoData(this.view)
        const sourceTextSub = subs.find(s => 'text' in s.data)
        if (!sourceTextSub) { return }

        this.text = (sourceTextSub.data as Text).text || undefined
      } else {
        const sourceSubs = this.subAnnotations as ImageSubAnnotation[]
        const sourceTextSub = sourceSubs.find(s => s.type === 'text')
        if (!sourceTextSub) { return }

        this.text = (sourceTextSub.data as Text).text || undefined
      }
      return
    }

    const data: AnnotationData = this.isVideoAnnotation()
      ? this.inferVideoData(this.view).data
      : this.data

    if (Object.keys(data).length === 0) { return }

    const textSources: string[] = []
    for (const source of data.sources) {
      const sourceAnnotation =
        this.view.annotationManager.mainAnnotations.find(a => a.id === source.id)
      if (!sourceAnnotation) { continue }

      if (sourceAnnotation.isVideoAnnotation()) {
        const sourceSubs =
          this.view.annotationManager.inferVideoSubAnnotationDataOnly(sourceAnnotation.data)
        const text = 'text' in sourceSubs ? sourceSubs.text.text || '' : ''
        textSources.push(text)
      } else {
        const sourceSubs = sourceAnnotation.subAnnotations as ImageSubAnnotation[]
        const sourceTextSub = sourceSubs.find(s => s.type === 'text')
        if (!sourceTextSub) { continue }

        const text = (sourceTextSub.data as Text).text || ''
        textSources.push(text)
      }
    }
    this.text = textSources.join(' ')
  }

  /**
   * Method that will return a shallow-cloned annotation
   * Shallow cloned annotation will copy all the instance parameters in addition to params
   *
   * @param params Instance params that will be added to the new annotation
   */
  public shallowClone (params?: Partial<CreateAnnotationParams>): Annotation {
    return new Annotation(this.view, {
      annotation: this,
      shallowClone: true,
      cloneParams: params
    })
  }

  /**
   * Method that will return a deep-cloned annotation
   * Deep cloned annotation will copy all the parameters and assign a new id
   * Annotation Data will be deeply cloned and subAnnotations will be newly created
   *
   * @param params Instance params that will be added to the new annotation
   */
  public clone (params?: Partial<CreateAnnotationParams>): Annotation {
    const newAnnotation = new Annotation(this.view, { annotation: this, cloneParams: params })
    newAnnotation.id = uuidv4()
    return newAnnotation
  }

  /**
   * Method that return if the current annotation is video or not
   */
  public isVideoAnnotation (): this is VideoAnnotation {
    return isVideoAnnotation(this)
  }

  /**
   * Method that return if the current annotation is image or not
   */
  public isImageAnnotation (): this is ImageAnnotation {
    return isImageAnnotation(this)
  }

  public isRasterAnnotation (): this is MaskAnnotation {
    return isRasterAnnotation(this)
  }

  private getRaster (): Raster | undefined {
    return this.view.rasterManager?.getRasterForFileInView()
  }

  public highlight (): void {
    if (this._isHighlighted) { return }

    this._isHighlighted = true
  }

  public unhighlight (): void {
    this._isHighlighted = false
  }

  public select (): void {
    if (this._isSelected) { return }

    this._isSelected = true
  }

  public deselect (): void {
    if (!this._isSelected) { return }

    const renderer = this.view.renderManager.rendererFor(this.type)
    if (renderer && 'getAllVertices' in renderer) {
      const vertices = renderer.getAllVertices(this, this.view)
      vertices.forEach(vertex => {
        vertex.isSelected = false
      })
    }

    this._isSelected = false
  }

  public show (updateStore: boolean = true): void {
    if (this._isVisible) { return }
    if (updateStore) {
      this.view.store.commit('workview/SHOW_ANNOTATION', this.id)
    }

    this._isVisible = true
  }

  public hide (updateStore: boolean = true): void {
    if (!this._isVisible) { return }
    if (updateStore) {
      this.view.store.commit('workview/HIDE_ANNOTATION', this.id)
    }

    this._isVisible = false
  }

  // Initializations

  private constructFromPayload (payload: StageAnnotation): void {
    const type = this.view.annotationManager.resolveAnnotationType(payload)
    if (!type) { throw new Error('Cannot resolve annotation type') }

    const data = this.normalizeData(type, payload.data)
    if (!data) { throw new Error('Cannot normalize annotation data') }

    this.id = payload.id
    this.classId = payload.annotation_class_id
    this.data = data
    this.id = payload.id
    this._isHighlighted = payload.isHighlighted
    this._isSelected = payload.isSelected
    this._isVisible = payload.isVisible
    this.type = type
    this.workflowStageId = payload.workflow_stage_id
    this.zIndex = payload.z_index

    this.actors = payload.actors

    if ('frames' in payload.data || 'sub_frames' in payload.data) {
      this.initializeVideoSubAnnotations(payload.data)
    } else {
      this.initializeSubAnnotations(payload.data)
    }

    this.iouMatches = payload.iou_matches
  }

  private constructSubAnnotation (payload: SubAnnotationPayload): void {
    const { parent, data, type } = payload

    this.classId = parent.classId
    this.data = data
    this.id = uuidv4()
    this._isHighlighted = false
    this._isSelected = false
    this._isVisible = true
    this.parentId = parent.id
    this.subAnnotations = []
    this.type = type
    this.workflowStageId = parent.workflowStageId
    this.zIndex = parent.zIndex
    this.actors = []
  }

  private constructFromInferenceData (
    inferenceData: InferenceResult,
    inferenceClasses: TrainedModelPayload['classes']
  ): void {
    const inferenceLabel = inferenceData.label || inferenceData.name
    if (!inferenceLabel) { throw new Error('Cannot construct inference result. Missing label') }

    const inferenceClass = inferenceClasses.find(c => c.name === inferenceLabel)
    if (!inferenceClass) {
      throw new Error(`Cannot construct inference result. Unknown label: ${inferenceLabel}`)
    }

    const { type } = inferenceClass
    const label = inferenceClass.display_name || inferenceClass.name

    const normalizedData = this.normalizeData(type, inferenceData)
    if (!normalizedData) { throw new Error('Cannot normalize annotation data') }

    this.id = inferenceData.id || uuidv4()
    this.type = type
    this.classId = 0
    this.data = { ...normalizedData, label }

    // when rendering inference annotations, there is no access to db annotation classes

    this._isSelected = false
    this._isVisible = true
    this._isHighlighted = false

    const subAnnotationData = { ...this.data }
    if (inferenceData.inference) {
      subAnnotationData.inference = inferenceData.inference
    }
    if (inferenceData.text) {
      subAnnotationData.text = inferenceData.text
    }
    this.initializeSubAnnotations(subAnnotationData)

    this.zIndex = 0
    this.actors = []
  }

  private constructFromParams (params: CreateAnnotationParams): void {
    const attrs = { ...DEFAULT_FLAGS, ...params }
    this.id = attrs.id || uuidv4()
    this.classId = attrs.classId!
    this.data = attrs.data
    this._isHighlighted = attrs.isHighlighted
    this._isSelected = attrs.isSelected
    this._isVisible = attrs.isVisible
    this.subAnnotations = []
    this.type = attrs.type
    this.zIndex = attrs.zIndex
    this.workflowStageId = attrs.workflowStageId
    this.actors = params.actors

    /**
     * If this is tag annotation, no need to select/highlight by default
     */
    if (this.type === 'tag') {
      this._isSelected = false
      this._isHighlighted = false
    }

    if (isVideoAnnotationData(attrs.data)) {
      this.initializeVideoSubAnnotations(attrs.data)
    } else {
      this.initializeSubAnnotations(attrs.data)
    }
  }

  private shallowCloneInstance (
    annotation: Annotation,
    params?: Partial<CreateAnnotationParams>
  ): void {
    this.id = annotation.id
    this.type = (params && params.type) || annotation.type
    this.parentId = annotation.parentId
    this.classId = (params && params.classId) || annotation.classId
    this._isSelected = (params && params.isSelected) || annotation._isSelected
    this._isHighlighted = (params && params.isHighlighted) || annotation._isHighlighted
    this._isVisible = (params && params.isVisible) || annotation._isVisible
    this.data = (params && params.data) || annotation.data
    this.zIndex = (params && params.zIndex) || annotation.zIndex
    this.workflowStageId = (params && params.workflowStageId) || annotation.workflowStageId
    this.path2D = annotation.path2D
    this.subAnnotations = (params && params.subAnnotations) || annotation.subAnnotations
    this.actors = (params && params.actors) || annotation.actors
    this.boundingBox = annotation.boundingBox
    this.text = annotation.text
  }

  private cloneInstance (
    annotation: Annotation,
    params?: Partial<CreateAnnotationParams>
  ): void {
    this.id = annotation.id
    this.type = (params && params.type) || annotation.type
    this.parentId = annotation.parentId
    this.classId = (params && params.classId) || annotation.classId
    this._isSelected = (params && params.isSelected) || annotation._isSelected
    this._isHighlighted = (params && params.isHighlighted) || annotation._isHighlighted
    this._isVisible = (params && params.isVisible) || annotation._isVisible
    this.data = cloneDeep((params && params.data) || annotation.data)
    this.zIndex = (params && params.zIndex) || annotation.zIndex
    this.workflowStageId = (params && params.workflowStageId) || annotation.workflowStageId
    this.path2D = annotation.path2D
    this.actors = (params && params.actors) || annotation.actors
    this.boundingBox = annotation.boundingBox
    this.text = annotation.text

    const data = annotation.serializeData()
    if (!data) { return }
    if (isVideoAnnotationData(data)) {
      this.initializeVideoSubAnnotations(data)
    } else {
      this.initializeSubAnnotations(data)
    }
  }

  private initializeSubAnnotations (data: AnnotationData): void {
    const normalizedSubAnnotations = this.normalizeSubAnnotations(data)
    const subAnnotations: Annotation[] = []

    if (!Array.isArray(normalizedSubAnnotations)) {
      this.subAnnotations = subAnnotations
      return
    }

    normalizedSubAnnotations.forEach(({ type, data }) => {
      if (!data) { return }
      const subAnnotation = new Annotation(this.view, {
        subAnnotationPayload: { parent: this, data, type }
      })
      if (!Array.isArray(subAnnotations)) { return }
      subAnnotations.push(subAnnotation)
    })

    this.subAnnotations = subAnnotations
  }

  private initializeVideoSubAnnotations (data: VideoAnnotationData | VideoDataPayload): void {
    const normalizedSubAnnotations = this.normalizeSubAnnotations(data)
    const subAnnotations: Annotation['subAnnotations'] = { frames: {} }

    for (const [index, normalizedSubAnnotation] of Object.entries(normalizedSubAnnotations)) {
      subAnnotations.frames[index] = []
      normalizedSubAnnotation.forEach(({ type, data }: {
        type: AnnotationTypeName;
        data: AnnotationData | null;
      }) => {
        if (!data) { return }
        const subAnnotation = new Annotation(
          this.view,
          { subAnnotationPayload: { parent: this, data, type } }
        )
        subAnnotations.frames[index].push(subAnnotation)
      })
    }
    this.subAnnotations = subAnnotations
  }

  /**
   * Normalizes the "data" key of a backend annotation payload
   */
  private normalizeData (type: string, data: AnnotationData): AnnotationData | null {
    if (type === 'mask' || isMaskAnnotationData(data)) {
      return this.normalizeMaskData(type, data)
    }

    return this.normalizeAnnotationData(type, data)
  }

  private normalizeAnnotationData (type: string, data: AnnotationData): AnnotationData | null {
    const { serializerManager } = this.view.editor
    const serializer =
      <AnnotationTypeSerializer<AnnotationData> | undefined>serializerManager.getSerializer(type)

    if (serializer === undefined) { return null }

    if ('frames' in data && 'segments' in data) {
      const frames: { [k: string]: AnnotationData } = {}
      Object.entries(data.frames).forEach(([frameIndex, frameData]) => {
        const hasAutoAnnotate = Object.keys(data.frames[frameIndex]).includes('auto_annotate')
        if (hasAutoAnnotate) {
          const autoAnnSerializer =
            <AnnotationTypeSerializer<AutoAnnotateData> | undefined>
            serializerManager.getSerializer<AutoAnnotateData>('auto_annotate')

          if (!autoAnnSerializer) { return null }

          const deserializedAutoAnnData = autoAnnSerializer.deserialize(frameData)
          if (deserializedAutoAnnData) {
            frames[frameIndex] = {
              ...frames[frameIndex],
              auto_annotate: deserializedAutoAnnData
            }
          }

          const deserializedData = serializer.deserialize(frameData)
          if (deserializedData) {
            frames[frameIndex] = {
              ...frames[frameIndex],
              ...deserializedData
            }
          }
          return
        }
        const deserializedData = serializer.deserialize(frameData)
        if (deserializedData) {
          frames[frameIndex] = deserializedData
        }
      })
      return { ...data, frames }
    }

    return serializer.deserialize(data)
  }

  private normalizeMaskData (type: string, data: AnnotationData): AnnotationData | null {
    const { serializerManager } = this.view.editor
    const serializer =
      <RasterTypeSerializer<AnnotationData> | undefined>serializerManager.getSerializer(type)
    const raster = this.getRaster()

    if (serializer === undefined || raster === undefined) {
      return null
    }

    if ('frames' in data && 'segments' in data) {
      const frames: { [k: string]: AnnotationData } = {}
      Object.entries(data.frames).forEach(([frameIndex, frameData]) => {
        const hasAutoAnnotate = Object.keys(data.frames[frameIndex]).includes('auto_annotate')
        if (hasAutoAnnotate) {
          const autoAnnSerializer =
            <AnnotationTypeSerializer<AutoAnnotateData> | undefined>
            serializerManager.getSerializer<AutoAnnotateData>('auto_annotate')

          if (!autoAnnSerializer) { return null }

          const deserializedAutoAnnData = autoAnnSerializer.deserialize(frameData)
          if (deserializedAutoAnnData) {
            frames[frameIndex] = {
              ...frames[frameIndex],
              auto_annotate: deserializedAutoAnnData
            }
          }

          const deserializedData = serializer.deserialize(frameData, raster, this.id)
          if (deserializedData) {
            frames[frameIndex] = {
              ...frames[frameIndex],
              ...deserializedData
            }
          }
          return
        }
        const deserializedData = serializer.deserialize(frameData, raster, this.id)
        if (deserializedData) {
          frames[frameIndex] = deserializedData
        }
      })
      return { ...data, frames }
    }

    return serializer.deserialize(data, raster, this.id)
  }

  private normalizeSubAnnotations (
    data: AnnotationData
  ): NormalizedSubAnnotation[] | { [k: string]: NormalizedSubAnnotation[] } {
    if (!('sub_frames' in data)) {
      return this.normalizeSubAnnotationsData(data)
    }

    const subAnnotations: {
      [k: string]: {
        type: AnnotationTypeName;
        data: AnnotationData | null;
      }[]
    } = {}

    for (const [index, frameData] of Object.entries(data.sub_frames)) {
      subAnnotations[index] = this.normalizeSubAnnotationsData(frameData as AnnotationData)
    }

    return subAnnotations
  }

  private normalizeSubAnnotationsData (
    data: AnnotationData
  ): { type: AnnotationTypeName, data: AnnotationData | null }[] {
    const { subAnnotationTypes } = this.view.annotationManager
    return (Object.keys(data) as AnnotationTypeName[])
      .filter((type) => subAnnotationTypes.includes(type))
      .map(type => ({ type, data: this.normalizeAnnotationData(type, data) }))
  }

  // Serializations
  public serialize (): StageAnnotationWithOptionalStageId | null {
    return this.serializeStageAnnotation()
  }

  /**
   * Resolves frames and sub_frames of VideoAnnotationData from ImageAnnotationData
   * When the annotation is created for the first time, the data will be ImageAnnotationData format.
   * If it is video annotation, we need to resolve VideoAnnotationData format.
   * This function just resolves `frames` and `sub_frames` of VideoAnnotationData.
   */
  private resolveVideoFrameData (
    data: AnnotationData,
    startFrame: number
  ): Pick<VideoAnnotationData, 'frames' | 'sub_frames'> {
    const { mainAnnotationTypes } = this.view.annotationManager
    const frameFields = [...mainAnnotationTypes, 'auto_annotate']
    return {
      frames: {
        [startFrame]: {
          ...pick(data, frameFields),
          keyframe: true
        }
      },
      sub_frames: {
        [startFrame]: {
          ...omit(data, frameFields),
          keyframe: true
        }
      }
    }
  }

  // eslint-disable-next-line camelcase
  private serializeStageAnnotation (): StageAnnotationWithOptionalStageId | null {
    const data = this.serializeData()
    if (!data) { return null }

    let annotationData = data

    if (
      this.view.fileManager.isProcessedAsVideo &&
      // the annotation is not being pasted. a pasted annotation already has
      // frames and segments properly set in. Search for 'clipboard.paste'
      !('frames' in data)
    ) {
      // this means we are serializing a newly created, not yet persisted video
      // we have to give the one and only segment in the annotation the proper duration
      // we also have to structure the data corectly
      const segments = getInitialVideoAnnotationSegments(this.view.editor)
      const startFrame = segments[0][0]

      const { frames, sub_frames: subFrames } = this.resolveVideoFrameData(data, startFrame)

      const interpolated = enableInterpolateByDefault(
        this.view.renderManager.rendererFor(this.type)
      )

      annotationData = {
        frames,
        sub_frames: subFrames,
        segments,
        interpolated,
        interpolate_algorithm: this.data.interpolate_algorithm
      }
    }

    const stage =
      this.view.store.state.workview.v2WorkflowItemState?.current_stage_instances.find(
        (s) => s.user_id === this.view.store.state.user.profile?.id
      )?.stage

    const annotationGroupId =
      (stage?.type === StageType.Annotate
        ? stage.config.annotation_group_id
        : null) ?? null

    return {
      annotation_class_id: this.classId,
      annotation_group_id: annotationGroupId,
      data: annotationData,
      id: this.id,
      context_keys: {
        slot_names: [this.view.fileManager.slotName]
      },
      isHighlighted: this.isHighlighted,
      isSelected: this.isSelected,
      isVisible: this.isVisible,
      z_index: this.zIndex,
      actors: this.actors,
      ...(this.workflowStageId && { workflow_stage_id: this.workflowStageId })
    }
  }

  private serializeData (): StageAnnotationPayload['data'] | null {
    if (this.isRasterAnnotation()) {
      return this.serializeRasterData()
    }

    return this.serializeAnnotationData()
  }

  private serializeAnnotationData (): StageAnnotationPayload['data'] | null {
    const serializer = <AnnotationTypeSerializer<AnnotationData> | undefined>
      this.view.editor.serializerManager.getSerializer(this.type)
    const autoAnnSerializer = <AnnotationTypeSerializer<AnnotationData> | undefined>
      this.view.editor.serializerManager.getSerializer<AutoAnnotateData>('auto_annotate')

    if (!serializer || !autoAnnSerializer) {
      console.warn(`can't serialize '${this.type}'`)
      return null
    }

    if (this.isImageAnnotation()) {
      const data = serializer.serialize(this.data)
      for (const subAnnotation of this.subAnnotations) {
        data[subAnnotation.type] = subAnnotation.data
      }
      return data
    }

    if (!this.isVideoAnnotation()) { return null }

    const serializedFrames: { [k: string]: AnnotationData } = {}
    const serializedSubFrames: { [k: string]: AnnotationData } = {}
    const frames = this.data.frames
    const subAnnotations = this.subAnnotations

    let isFirst = true

    for (const [frame, data] of Object.entries(frames)) {
      if (isFirst) {
        isFirst = false

        if (data.auto_annotate) {
          serializedFrames[frame] = {
            ...serializedFrames[frame],
            ...autoAnnSerializer.serialize(data.auto_annotate),
            ...serializer.serialize(data),
            keyframe: true
          }
        } else {
          serializedFrames[frame] = { ...serializer.serialize(data), keyframe: true }
        }
      } else {
        serializedFrames[frame] = { ...serializer.serialize(data), keyframe: true }
      }
    }

    for (const [k, v] of Object.entries(subAnnotations.frames)) {
      if (v.length > 0) {
        serializedSubFrames[k] = { keyframe: true }
      }
      for (const subAnnotation of subAnnotations.frames[k] || []) {
        serializedSubFrames[k][subAnnotation.type] = subAnnotation.data
      }
    }

    return {
      ...this.data,
      frames: serializedFrames,
      sub_frames: serializedSubFrames
    }
  }

  /**
   * Returns correct BBox for the annotation.
   * getBBox calculates it's wrong sometimes (eclipse for e.g.).
   */
  public getOriginBBox (view: View): BBox | undefined {
    return getOriginBBox(view, this)
  }

  private serializeRasterData (): StageAnnotationPayload['data'] | null {
    const serializer = <RasterTypeSerializer<AnnotationData> | undefined>
      this.view.editor.serializerManager.getSerializer(this.type)
    const autoAnnSerializer = <AnnotationTypeSerializer<AnnotationData> | undefined>
      this.view.editor.serializerManager.getSerializer<AutoAnnotateData>('auto_annotate')

    const raster = this.getRaster()

    if (!serializer || !autoAnnSerializer || raster === undefined) {
      console.warn(`can't serialize '${this.type}'`)
      return null
    }

    if (this.isImageAnnotation()) {
      const data = serializer.serialize(this.data, raster, this.id)
      for (const subAnnotation of this.subAnnotations) {
        data[subAnnotation.type] = subAnnotation.data
      }
      return data
    }

    if (this.isVideoAnnotation()) {
      /**
       * TODO -> Video support: We actually need to get the raster per frame for video,
       * dealing with in a later ticket. Apparently we will need to use segments rather
       * than frames.
       */
      console.warn('No Raster video support yet')
    }

    return null
  }

  public getBBox (view: View): BBox | undefined {
    return getBBox(view, this)
  }

  private cachedInterpolatedData: {
    hash?: string,
    data?: AnnotationData
  } = {}

  /**
   * Infers the data payload for a video annotation
   */
  public inferVideoData (view: View = this.view): VideoAnnotationDataPayload {
    const emptyPayload: VideoAnnotationDataPayload = {
      data: {},
      subs: [],
      keyframe: false,
      subkeyframe: false,
      interpolateAlgorithm: 'linear-1.1'
    }
    const {
      frames,
      sub_frames: subFrames,
      segments,
      interpolate_algorithm: interpolateAlgorithm
    } = this.data

    if (!this.isVideoAnnotation()) { return emptyPayload }
    if (!isVideoSubAnnotations(this.subAnnotations)) { return emptyPayload }

    const { currentFrameIndex } = view
    // Figure out if the video annotation is visible
    const range =
      segments?.find(
        (range: [number, number]) => currentFrameIndex >= range[0] && currentFrameIndex < range[1]
      )

    if (!range) { return { ...emptyPayload } }

    const hasKeyframe = currentFrameIndex in frames
    const hasSubkeyframe = subFrames && currentFrameIndex in subFrames

    // See if the data is present in a keyframe
    if (hasKeyframe) {
      return {
        data: frames[currentFrameIndex] || {},
        subs: this.subAnnotations.frames[currentFrameIndex] || [],
        keyframe: hasKeyframe,
        subkeyframe: hasSubkeyframe,
        interpolateAlgorithm
      }
    }

    // Find the closest keyframe to the left of the current index
    // and the closest keyframe to the right of the current index
    let prevIdx: number | null = null
    let nextIdx: number | null = null
    const sortedFrames = Object.keys(frames).map(idx => parseInt(idx)).sort((a, b) => a - b)
    for (const frameIndex of sortedFrames) {
      if (frameIndex < currentFrameIndex) {
        prevIdx = frameIndex
      }
      if (frameIndex > currentFrameIndex) {
        nextIdx = frameIndex
        break
      }
    }

    if (prevIdx === null && nextIdx !== null) {
      return {
        data: frames[nextIdx], subs: [], keyframe: false, subkeyframe: false, interpolateAlgorithm
      }
    }

    if (prevIdx !== null && nextIdx === null) {
      return {
        data: frames[prevIdx],
        subs: this.subAnnotations.frames[prevIdx] || [],
        keyframe: false,
        subkeyframe: false,
        interpolateAlgorithm
      }
    }

    const isMainAnnotationTypeRenderer = (
      r: AnnotationTypeRenderer | undefined
    ): r is MainAnnotationTypeRenderer =>
      !!r && ('moveVertex' in r) && ('getAllVertices' in r) && ('translate' in r)

    const supportsInterpolation = (r: AnnotationTypeRenderer | undefined):
      r is MainAnnotationTypeRenderer & {
        interpolate: Exclude<MainAnnotationTypeRenderer['interpolate'], undefined>
      } =>
      isMainAnnotationTypeRenderer(r) && !!r.supportsInterpolate

    if (prevIdx !== null && nextIdx !== null) {
      const renderer = view.renderManager.rendererFor(this.type)
      if (!supportsInterpolation(renderer) || !this.data.interpolated) {
        return {
          data: frames[prevIdx],
          subs: this.subAnnotations.frames[prevIdx] || [],
          keyframe: false,
          subkeyframe: false,
          interpolateAlgorithm
        }
      }

      const algorithm: Exclude<InterpolationAlgorithm, undefined> =
        this.data.interpolate_algorithm || 'linear-1.0'

      const interpolationFactor = (currentFrameIndex - prevIdx) / (nextIdx - prevIdx)
      const params: LinearInterpolationParams = {
        algorithm,
        interpolationFactor
      }

      const newHash = this.getDataHash(frames[prevIdx], frames[nextIdx], params)

      // Cache data only for polygon.
      // Polygon has object reference issues.
      if (this.type !== 'polygon' || this.cachedInterpolatedData?.hash !== newHash) {
        this.cachedInterpolatedData.hash = newHash
        this.cachedInterpolatedData.data = renderer.interpolate(
          frames[prevIdx],
          frames[nextIdx],
          params
        )
      }
      const { data } = this.cachedInterpolatedData

      if (!data) { return { ...emptyPayload } }

      return {
        data,
        subs: this.subAnnotations.frames[prevIdx] || [],
        keyframe: false,
        subkeyframe: false,
        interpolateAlgorithm
      }
    }

    return { ...emptyPayload }
  }

  private getDataHash (
    prevData: Polygon,
    nextData: Polygon,
    params: LinearInterpolationParams
  ): string {
    return md5(
      JSON.stringify(prevData.path) +
      JSON.stringify(nextData.path) +
      params.interpolationFactor.toString()
    )
  }

  clear (): void {
    this.clearCache()
    this.data = []
    this.subAnnotations = []
    this.actors = []
    this._annotationClass = undefined
    this.path2D = undefined
    this.boundingBox = undefined
  }

  clearCache (): void {
    this.path2D = undefined
    this.cachedInterpolatedData = {}
  }
}

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export type ImageAnnotation = Annotation & {
  data: AnnotationData
  subAnnotations: ImageSubAnnotation[]
}

export type VideoAnnotation = Annotation & {
  data: VideoAnnotationData
  subAnnotations: VideoSubAnnotations
}

export type MaskAnnotation = Annotation & {
  data: WithRequiredProperty<AnnotationData, 'rasterId'>
  subAnnotations: ImageSubAnnotation[]
}
