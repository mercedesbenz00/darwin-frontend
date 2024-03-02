import { AnnotationTypePayload } from '@/store/types'

const baseType: AnnotationTypePayload = {
  id: -1,
  name: 'bounding_box',
  granularity: 'main',
  data_skeleton: {},
  metadata_skeleton: {},
  description: '',
  subs: [],
  visible: true
}

export const polygon: AnnotationTypePayload = {
  ...baseType,
  id: 41,
  name: 'polygon',
  granularity: 'main'
}

export const boundingBox: AnnotationTypePayload = {
  ...baseType,
  id: 51,
  name: 'bounding_box',
  granularity: 'main'
}

export const tag: AnnotationTypePayload = {
  ...baseType,
  id: 61,
  name: 'tag',
  granularity: 'main'
}

export const text: AnnotationTypePayload = {
  ...baseType,
  id: 71,
  name: 'text',
  granularity: 'sub'
}
