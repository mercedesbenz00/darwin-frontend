import { AnnotationClassPayload } from '@/store/types'

import { dataset } from './dataset'

const image = (url: string): AnnotationClassPayload['images'][0] => ({
  id: url,
  index: 0,
  key: url,
  crop_key: url,
  crop_url: url,
  original_image_url: url,
  x: 1,
  y: 1,
  image_height: 50,
  image_width: 50,
  scale: 1
})

export const lantern: AnnotationClassPayload = {
  annotation_types: ['bounding_box'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: "It's a lantern, you’ve seen one before.",
  id: 1,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/7.jpg')],
  metadata: { _color: 'rgba(0,255,85,1.0)' },
  name: 'Lantern',
  inserted_at: new Date().toISOString()
}

export const person: AnnotationClassPayload = {
  annotation_types: ['bounding_box'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  // eslint-disable-next-line max-len
  description: 'A human person. Do not include backpacks or other large worn accessories within their annotation.',
  id: 2,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/8.jpg')],
  metadata: { _color: 'rgba(255,0,0,1.0)' },
  name: 'Person',
  inserted_at: new Date().toISOString()
}

export const car: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon', 'directional_vector'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Any four-wheeled engine powered vehicle.',
  id: 3,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/9.jpg')],
  metadata: { _color: 'rgba(255,170,0,1.0)' },
  name: 'Car',
  inserted_at: new Date().toISOString()
}

export const sky: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Include anywhere you see the sky.',
  id: 4,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/10.jpg')],
  metadata: { _color: 'rgba(0,85,255,1.0)' },
  name: 'Sky',
  inserted_at: new Date().toISOString()
}

export const wall: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: '',
  id: 5,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/11.jpg')],
  metadata: { _color: 'rgba(255,0,255,1.0)' },
  name: 'Wall',
  inserted_at: new Date().toISOString()
}

export const chimneyStack: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'A large chimney stack.',
  id: 6,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/12.jpg')],
  metadata: { _color: 'rgba(85,0,255,1.0)' },
  name: 'Chimney Stack',
  inserted_at: new Date().toISOString()
}

export const horse: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon', 'attributes', 'instance_id'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Include the tail but ignore waving strands of hair.',
  id: 7,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/18.jpg')],
  metadata: { _color: 'rgba(243,190,0,1.0)' },
  name: 'Horse',
  inserted_at: new Date().toISOString()
}

export const shark: AnnotationClassPayload = {
  annotation_types: ['tag'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: '',
  id: 8,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/14.jpg')],
  metadata: { _color: 'rgba(0,255,255,1.0)' },
  name: 'Shark',
  inserted_at: new Date().toISOString()
}

export const gauge: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon', 'directional_vector', 'attributes'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: '',
  id: 9,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/15.jpg')],
  metadata: { _color: 'rgba(170,0,255,1.0)' },
  name: 'Gauge',
  inserted_at: new Date().toISOString()
}

export const printedText: AnnotationClassPayload = {
  annotation_types: ['bounding_box', 'text'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Text printed on paper or cardboard.',
  id: 10,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/19.jpg')],
  metadata: { _color: 'rgba(255,85,0,1.0)' },
  name: 'Printed Text',
  inserted_at: new Date().toISOString()
}

export const window: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon', 'text'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Windows and frames. if objects are visible through the glass, exclude it.',
  id: 11,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/17.jpg')],
  metadata: { _color: 'rgba(47, 128, 237, 1.0)' },
  name: 'Window',
  inserted_at: new Date().toISOString()
}

export const dog: AnnotationClassPayload = {
  annotation_types: ['auto_annotate', 'polygon', 'attributes', 'instance_id'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Any breed of dog.',
  id: 12,
  images: [image('https://darwin-public.s3-eu-west-1.amazonaws.com/tutorial_v2/classes/20.jpg')],
  metadata: { _color: 'rgba(87,168,241,1.0)' },
  name: 'Dog',
  inserted_at: new Date().toISOString()
}

export const ball: AnnotationClassPayload = {
  annotation_types: ['ellipse', 'attributes', 'instance_id', 'text'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Any kind of sports ball',
  id: 13,
  images: [],
  metadata: { _color: 'rgba(255,199,0,1.0)' },
  name: 'Ball',
  inserted_at: new Date().toISOString()
}

export const humanPose: AnnotationClassPayload = {
  annotation_types: ['skeleton'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'A human body pose',
  id: 14,
  images: [],
  metadata: {
    _color: 'rgba(219,0,255,1.0)',
    skeleton: {
      edges: [
        { from: 'Head', to: 'Neck' },
        { from: 'Neck', to: 'Right shoulder' },
        { from: 'Right shoulder', to: 'Right elbow' },
        { from: 'Right elbow', to: 'Right hand' },
        { from: 'Neck', to: 'Stomach' },
        { from: 'Stomach', to: 'Right leg' },
        { from: 'Right leg', to: 'Right foot' },
        { from: 'Stomach', to: 'Left leg' },
        { from: 'Left leg', to: 'Left foot' },
        { from: 'Neck', to: 'Left shoulder' },
        { from: 'Left shoulder', to: 'Left elbow' },
        { from: 'Left elbow', to: 'Left hand' }
      ],
      nodes: [
        { name: 'Head', x: 0.5, y: 0.08888888888888889 },
        { name: 'Neck', x: 0.5, y: 0.21851851851851853 },
        { name: 'Right shoulder', x: 0.3967889908256881, y: 0.2518518518518518 },
        { name: 'Right elbow', x: 0.3577981651376147, y: 0.44074074074074077 },
        { name: 'Right hand', x: 0.36926605504587157, y: 0.6185185185185185 },
        { name: 'Left shoulder', x: 0.6330275229357798, y: 0.2518518518518518 },
        { name: 'Left elbow', x: 0.658256880733945, y: 0.4222222222222222 },
        { name: 'Left hand', x: 0.6536697247706422, y: 0.6037037037037037 },
        { name: 'Stomach', x: 0.5114678899082569, y: 0.6333333333333333 },
        { name: 'Right leg', x: 0.45642201834862384, y: 0.7296296296296296 },
        { name: 'Left leg', x: 0.5711009174311926, y: 0.7296296296296296 },
        { name: 'Right foot', x: 0.44954128440366975, y: 0.9333333333333333 },
        { name: 'Left foot', x: 0.5848623853211009, y: 0.9296296296296296 }
      ]
    }
  },
  name: 'Human Pose',
  inserted_at: new Date().toISOString()
}

export const pupil: AnnotationClassPayload = {
  annotation_types: ['keypoint'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'The center of the pupil',
  id: 15,
  images: [],
  metadata: { _color: 'rgba(255,0,122,1.0)' },
  name: 'Pupil',
  inserted_at: new Date().toISOString()
}

export const lane: AnnotationClassPayload = {
  annotation_types: ['line'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'The lane on a road',
  id: 16,
  images: [],
  metadata: { _color: 'rgba(255,245,0,1.0)' },
  name: 'Lane',
  inserted_at: new Date().toISOString()
}

export const vehicle: AnnotationClassPayload = {
  annotation_types: ['cuboid'],
  team_id: dataset.team_id,
  datasets: [{ id: dataset.id }],
  description: 'Any 4-wheeled vehicle',
  id: 17,
  images: [],
  metadata: { _color: 'rgba(143,255,0,1.0)' },
  name: 'Vehicle',
  inserted_at: new Date().toISOString()
}

export const annotationClasses: AnnotationClassPayload[] = [
  ball,
  car,
  chimneyStack,
  dog,
  gauge,
  horse,
  humanPose,
  lane,
  lantern,
  person,
  printedText,
  pupil,
  shark,
  sky,
  wall,
  window,
  vehicle
]
