import { InterpolationAlgorithm } from '@/engine/interpolate'
import { InferenceMetadata } from '@/engineCommon/backend'
import { CommentVertices } from '@/engineCommon/comment'

/**
 * Structure for the auto_annotate "meta" sub-annotation data
 *
 * This is what gets stored under
 * - `annotation.data.auto_annotate` for image annotations
 * - `annotation.data.frames[index].auto_annotate` for video annotations
 *
 * When the main annotation was created using clicker.
 */
export type AutoAnnotateData = {
  clicks: { x: number, y: number, type: 'add' | 'remove' }[]
  bbox: { x1: number, y1: number, x2: number, y2: number }
  model: string
}

/**
 * Structure for the bounding_box main annotation data
 *
 * This is what gets stored under
 * - `annotation.data.bounding_box` for image annotations
 * - `annotation.data.frames[index].bounding_box` for video annotations
 *
 * When the main annotation is of type bounding_box
 */
export type BoundingBoxData = {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Structure for the skeleton main annotation data
 *
 * This is what gets stored under
 * - `annotation.data.skeleton` for image annotations
 * - `annotation.data.frames[index].skeleton` for video annotations
 *
 * When the main annotation is of type skeleton
 */
export type SkeletonData = {
  nodes: {
    x: number
    y: number
    name: string
    occluded: boolean
  }[]
}

export const isCommentVertices = (data: AnnotationData): data is CommentVertices =>
  ('topLeft' in data && 'bottomLeft' in data && 'topRight' in data && 'bottomRight' in data)

/**
 * Structure of the backend-stored data payload for an image annotation
 *
 * Should be expanded with additional type data as we have time for it.
 */
export interface AnnotationData {
  /* eslint-disable camelcase */
  attributes?: any
  auto_annotate?: AutoAnnotateData
  bounding_box?: BoundingBoxData
  cuboid?: [BoundingBoxData, BoundingBoxData]
  directional_vector?: any
  ellipse?: any
  inference?: InferenceMetadata
  instance_id?: any
  keypoint?: any
  line?: any
  link?: any
  polygon?: any
  skeleton?: SkeletonData
  tag?: any
  text?: any

  /**
   * A bunch of places in code currently use AnnotationData incorrectly
   * We should gradually eliminate any keys outside of the type list above
   */
  [x: string]: any
  /* eslint-enable camelcase */
}

export type SubAnnotationData = AutoAnnotateData | SkeletonData | any

/**
 * Structure of the data payload an `Annotation` will get when it's built from
 * an inference result.
 */
export type NormalizedInferenceData = AnnotationData & { label: string }

/** Structure of the backend-stored data payload for a video annotation */
export type VideoAnnotationData = {
  /* eslint-disable camelcase */
  frames: { [frame: string]: AnnotationData }
  sub_frames: { [frame: string]: AnnotationData }
  /**
   * "segments" will be undefined when it's a "global" tag annotation
   */
  segments: [number, number][] | undefined
  interpolated: boolean
  interpolate_algorithm: InterpolationAlgorithm
  /* eslint-enable camelcase */
}
