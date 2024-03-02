import { AnnotationTypeName, DatasetPayload } from '@/store/types'

type SkeletonNodeMetadata = {
  name: string
  x: number
  y: number
}

type SkeletonEdgeMetadata = {
  from: string
  to: string
}

export type SkeletonMetadata = {
  nodes: SkeletonNodeMetadata[]
  edges: SkeletonEdgeMetadata[]
}

export type AnnotationClassMetadata = {
  _color: string,
  /**
   * When true, the class needs to be 100% filled during render
   * to prevent the annotators from seeing data image below.
   *
   * This is currently set manually in the database,
   * only valid for polygons and bounding boxes.
   *
   * Note that this is only a workaround until we can generate a
   * new blacked out image as a transformation stage in wf2
   */
  blackout?: boolean,
  skeleton?: SkeletonMetadata
  hotkeys?: string[]
}

export type AnnotationClassImagePayload = {
  /* eslint-disable camelcase */
  crop_key: string
  crop_url: string
  id: string
  image_height: number
  image_width: number
  index: number
  key: string
  original_image_url: string
  scale: number
  x: number
  y: number
  /* eslint-enable camelcase */
}

export type AnnotationClassPayload = {
  /* eslint-disable camelcase */
  annotation_types: AnnotationTypeName[]
  datasets: Array<Pick<DatasetPayload, 'id'>>
  description: string
  id: number;
  images: AnnotationClassImagePayload[]
  inserted_at: string;
  metadata: AnnotationClassMetadata;
  name: string;
  team_id: number
  /* eslint-enable camelcase */
}
