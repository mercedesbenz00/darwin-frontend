import { InterpolationAlgorithm } from '@/engine/interpolate'
import { InferenceMetadata } from '@/engineCommon/backend'

import { AnnotationActorPayload } from './AnnotationActorPayload'
import { WorkflowStagePayload } from './WorkflowStagePayload'

/* eslint-disable camelcase */

type Point = {
  x: number
  y: number
}

type BoundingBox = {
  x: number
  y: number
  w: number
  h: number
}

type AttributesDataPayload = {
  attributes: string[]
}

type AutoAnnotateDataPayload = {
  clicks: (Point & { type: 'add' | 'remove' })[]
  bbox: { x1: number, y1: number, x2: number, y2: number }
  model: string
}

type BoundingBoxDataPayload = BoundingBox

type DirectionalVectorDataPayload = {
  angle: number
  lenght: number
}

type EllipseDataPayload = {
  angle: number
  center: Point
  radius: Point
}

type InstanceIdDataPayload = {
  value: number
}

type KeyPointDataPayload = Point

type LineDataPayload = {
  path: Point[]
}

type LinkDataPayload = {
  from: string
  to: string
}

type PolygonDataPayload = {
  path: Point[]
  additional_paths?: Point[][]
}

type MaskDataPayload = {
  sparse_rle: number[],
  bounding_box?: BoundingBox
}

type RasterLayerDataPayload = {
  mask_annotation_ids_mapping: Record<string,number>,
  total_pixels: number,
  dense_rle: number[]
}

type SkeletonDataPayload = {
  nodes: (Point & {
    name: string
    occluded: boolean
  })[]
}

export type GraphDataPayload = {
  nodes: { id: string, name: string }[],
  edges: { start: string, end: string }[]
}

type StringDataPayload = {
  sources: { id: string, ranges: number[][] | null }[]
}

type TableDataPayload = {
  bounding_box: { x: number, y: number, w: number, h: number }
  cells: { id: string, row: number, col: number }[],
  row_offsets: number[],
  col_offsets: number[]
}

type TagDataPayload = {[K in never]: never}

type TextDataPayload = { text: string }

type MeasuresDataPayload = {
  delta: Point
  unit: {
    x: string,
    y: string
  }
}

/** Defines backend structure of the data field for an image annotation */
export type ImageDataPayload = {
  attributes?: AttributesDataPayload
  auto_annotate?: AutoAnnotateDataPayload
  bounding_box?: BoundingBoxDataPayload
  cuboid?: [BoundingBoxDataPayload, BoundingBoxDataPayload]
  directional_vector?: DirectionalVectorDataPayload
  ellipse?: EllipseDataPayload
  graph?: GraphDataPayload
  inference?: InferenceMetadata
  instance_id?: InstanceIdDataPayload
  keypoint?: KeyPointDataPayload
  line?: LineDataPayload
  link?: LinkDataPayload
  measures?: MeasuresDataPayload
  polygon?: PolygonDataPayload
  skeleton?: SkeletonDataPayload
  string?: StringDataPayload
  table?: TableDataPayload
  tag?: TagDataPayload
  text?: TextDataPayload,
  mask?: MaskDataPayload
  raster_layer?: RasterLayerDataPayload
}

type FrameKeys =
  'auto_annotate'
  | 'bounding_box'
  | 'cuboid'
  | 'ellipse'
  | 'keypoint'
  | 'line'
  | 'link'
  | 'measures'
  | 'polygon'
  | 'skeleton'
  | 'tag'

type SubFrameKeys = 'attributes' | 'directional_vector' | 'instance_id' | 'text'

export type FrameDataPayload =
  Pick<ImageDataPayload, FrameKeys | SubFrameKeys> & { keyframe?: boolean }

export type SubFrameDataPayload =
  Pick<ImageDataPayload, SubFrameKeys> & { keyframe?: boolean }

/**
 * Defines backend structure for the data field of a video annotation
 */
export type VideoDataPayload = {
  frames: Record<number, FrameDataPayload>
  interpolate_algorithm: InterpolationAlgorithm
  interpolated: boolean
  /**
   * "segments" will be undefined when it's a "global" tag annotation
   */
  segments: [number, number][] | undefined
  sub_frames?: Record<number, SubFrameDataPayload>
}

export type StageAnnotationPayload = {
  annotation_class_id: number
  annotation_group_id: string | null
  data: ImageDataPayload | VideoDataPayload
  id: string
  /**
   * Non-empty if this is a review stage that follows a blind stage.
   * Contains IOU info for annotations across blind stages.
   *
   * If the annotation is unmatched, the stage id will be null and the IOU will
   * be 0
   */
  iou_matches?: (
    [StageAnnotationPayload['id'], WorkflowStagePayload['id'], number] |
    [null, WorkflowStagePayload['id'], 0]
  )[]
  workflow_stage_id: number
  actors: AnnotationActorPayload[]

  /**
   * Null when annotation is a tag
   */
  z_index: number | null

  context_keys?: {
    slot_names: string[]
  }
}

/* eslint-enable camelcase */
