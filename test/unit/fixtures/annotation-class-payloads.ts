import { buildAnnotationClassPayload } from 'test/unit/factories'

export const flask = buildAnnotationClassPayload({
  id: 4,
  team_id: 1,
  name: 'Flask',
  metadata: { _color: 'rgba(4,4,4,0.5)' },
  description: '',
  annotation_types: ['polygon']
})

export const bottle = buildAnnotationClassPayload({
  id: 5,
  team_id: 1,
  name: 'Bottle',
  metadata: { _color: 'rgba(5,5,5,0.5)' },
  description: '',
  annotation_types: ['polygon']
})

export const scale = buildAnnotationClassPayload({
  id: 6,
  team_id: 1,
  name: 'Scale',
  metadata: { _color: 'rgba(6,6,6,0.5)' },
  description: '',
  annotation_types: ['bounding_box']
})

export const tag = buildAnnotationClassPayload({
  id: 7,
  name: 'Tag',
  metadata: { _color: 'rgba(7,7,7,0.5)' },
  team_id: 1,
  annotation_types: ['tag']
})

export const bean = buildAnnotationClassPayload({
  id: 8,
  name: 'Bean',
  metadata: { _color: 'rgba(8,8,8,0.5)' },
  team_id: 1,
  annotation_types: ['ellipse']
})
