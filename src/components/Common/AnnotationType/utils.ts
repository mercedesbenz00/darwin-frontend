import { AnnotationTypeName } from '@/store/types'

/**
 * List of non-meta annotation types. These are basically all types except
 * `measures` and `auto_annotate`.
 *
 * This list is important because these types usually get rendered and are in
 * some way visible to the user, while the remaining two are internal.
 */
export const SORTED_NON_META_TYPES: AnnotationTypeName[] = [
  'attributes',
  'auto_annotate',
  'bounding_box',
  'cuboid',
  'directional_vector',
  'ellipse',
  'graph',
  'inference',
  'instance_id',
  'keypoint',
  'line',
  'link',
  'measures',
  'polygon',
  'polyline',
  'skeleton',
  'string',
  'table',
  'tag',
  'text'
]

export const annotationTypeNameValidator = (value: string): boolean =>
  SORTED_NON_META_TYPES.some(t => t === value)
