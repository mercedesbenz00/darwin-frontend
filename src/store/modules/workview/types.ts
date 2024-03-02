import { CancelToken } from 'axios'

import { ColorMap, WindowLevels } from '@/engineCommon/imageManipulation'
import {
  AnnotationActorPayload,
  AnnotationClassPayload,
  RootState,
  TypedAction,
  TypedMutation
} from '@/store/types'
import { StageAnnotationPayload } from '@/store/types/StageAnnotationPayload'

import { WorkviewState } from './state'

export type WorkviewAction<T, R = any> = TypedAction<WorkviewState, RootState, T, R>
export type WorkflowMutation<R = any> = TypedMutation<WorkviewState, R>

type Renderable = {
  id: string
  isSelected: boolean
  isVisible: boolean
  isHighlighted: boolean
}

type Cancellable = {
  cancelToken?: CancelToken
}

/**
 * Used to manage annotations in the workview.
 *
 * Contains all data contained in the backend payload,
 * with added additional properties for render state management.
 */
export type StageAnnotation = Omit<StageAnnotationPayload, 'id'> & Renderable & Cancellable

export type LoadedItem = LoadedImage | LoadedVideo

export type RenderableImage = {
  /**
   * Image data loaded from the url directly
   */
  data: HTMLImageElement
  /**
   * Image raw data which we can touch pixel data
   */
  rawData: ImageData | null
  /**
   * Transformed raw pixel data after we applied the window levels and color map.
   */
  transformedData: CanvasImageSource | null
  /**
   * Last window levels which has affected the generation of current transformData
   */
  lastWindowLevels: WindowLevels | null
  /**
   * Last color map which has affected the generation of current transformData
   */
  lastColorMap: ColorMap | null
}

export type LoadedImage = {
  /** ID of the base image record */
  id: number

  /**
   * ID of the parent dataset image record, if any
   */
  datasetImageId: number | null

  /**
   * ID of the parent task record, if any
   */
  taskId: number | null

  url: string
  thumbnailURL: string
  originalFilename: string

  width: number
  height: number

  /** Only available if the full image has been loaded (not just metadata) */
  data: RenderableImage | null

  format?: string
  levels?: any
}

export type LoadedFrame = {
  seq: number
  hqUrl: string
  lqUrl: string
  hqData: RenderableImage | null
  lqData: RenderableImage | null
  hqDataLoaded: boolean
  lqDataLoaded: boolean
}

export type LoadedVideo = {
  id: number
  frames: { [frameIndex: number]: LoadedFrame }
  currentFrameIndex: number
  fps: number
}

// eslint-disable-next-line camelcase
export type NonTagStageAnnotation = StageAnnotation & { z_index: number }

export type UpdateStageAnnotationPayload = {
  annotation: StageAnnotation,
  data: StageAnnotationPayload
}

export type DatasetItemCursorMapping = {
  previous: string | null
  next: string | null
  ids: (string | number)[]
}

export type AnnotationActorStat = {
  actor: AnnotationActorPayload
  count: number
}

export type AnnotationClassStat = {
  annotationClass: AnnotationClassPayload
  count: number
}

export type ClassMapping = {
  annotationClassId: number | null,
  modelClassLabel: string
}[]
