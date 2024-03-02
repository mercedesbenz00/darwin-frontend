import { AnnotationClassPayload } from '@/store/types'

const baseClass: AnnotationClassPayload = {
  annotation_types: [],
  description: '',
  datasets: [],
  id: -1,
  images: [],
  inserted_at: '',
  metadata: { _color: '' },
  name: '',
  team_id: -1
}
export const flask: AnnotationClassPayload = {
  ...baseClass,
  id: 444,
  name: 'Flask',
  metadata: { _color: 'rgba(4,0,4,0.5)' },
  annotation_types: ['polygon']
}
export const scale: AnnotationClassPayload = {
  ...baseClass,
  id: 333,
  name: 'Scale',
  metadata: { _color: 'rgba(4,4,4,0.5)' },
  annotation_types: ['bounding_box']
}

export const pipette: AnnotationClassPayload = {
  ...baseClass,
  id: 444,
  name: 'Pipette',
  metadata: { _color: 'rgba(5,5,5,0.5)' },
  annotation_types: ['polygon']
}

export const bottle: AnnotationClassPayload = {
  ...baseClass,
  id: 445,
  name: 'Bottle',
  metadata: { _color: 'rgba(5,5,5,0.5)' },
  annotation_types: ['polygon']
}

export const blurry: AnnotationClassPayload = {
  ...baseClass,
  id: 555,
  name: 'Blurry',
  metadata: { _color: 'rgba(7,7,7,0.5)' },
  annotation_types: ['tag']
}

export const textBox: AnnotationClassPayload = {
  ...baseClass,
  id: 666,
  name: 'Text Box',
  metadata: { _color: 'rgba(7,11,7,0.5)' },
  annotation_types: ['bounding_box']
}

export const textField: AnnotationClassPayload = {
  ...baseClass,
  id: 667,
  name: 'Text Field',
  metadata: { _color: 'rgba(7,200,7,0.5)' },
  annotation_types: ['bounding_box', 'text']
}
