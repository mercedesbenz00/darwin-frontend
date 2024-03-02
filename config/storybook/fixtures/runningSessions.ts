import { ModelDevice } from '@/store/modules/neuralModel/types'
import { RunningSessionPayload } from '@/store/types'

const baseSession: RunningSessionPayload = {
  auto_start: false,
  auto_stop: false,
  id: '',
  access_level: 'public',
  device: ModelDevice.GPU,
  min: 1,
  max: 1,
  name: 'Base Session',
  inserted_at: '2020-01-0T00:00:00',
  updated_at: '2020-01-0T00:00:00',
  public: false,
  trained_model_id: 'base-trained-model',
  team_id: 1,
  meta: {
    classes: [],
    num_instances_available: 1,
    num_instances_starting: 0
  }
}

export const boxotron: RunningSessionPayload = {
  ...baseSession,
  id: 'box-o-tron-2000',
  min: 1,
  max: 3,
  name: 'Meticulous-Perceptron-Box-o-Tron-2000',
  meta: {
    ...baseSession.meta,
    classes: [
      { name: 'Super Box', id: 'class-1', type: 'bounding_box', subs: [] },
      { name: 'Amazing Box', id: 'class-2', type: 'bounding_box', subs: [] },
      { name: 'Cool Box', id: 'class-3', type: 'bounding_box', subs: [] },
      { name: 'OK Box', id: 'class-4', type: 'bounding_box', subs: [] },
      { name: 'Bad Box', id: 'class-5', type: 'bounding_box', subs: [] },
      { name: 'Random Box', id: 'class-6', type: 'bounding_box', subs: [] },
      { name: 'Another Box', id: 'class-7', type: 'bounding_box', subs: [] },
      { name: 'One More Box', id: 'class-8', type: 'bounding_box', subs: [] }
    ]
  }
}

export const catFinder: RunningSessionPayload = {
  ...baseSession,
  id: 'cat-finder',
  name: 'Cat Finder'
}

export const ocr: RunningSessionPayload = {
  ...baseSession,
  id: 'ocr',
  name: 'OCR',
  meta: {
    ...baseSession.meta,
    classes: [
      { name: 'Basic Text Field', id: 'field', type: 'bounding_box', subs: ['text'] },
      {
        name: 'Text With Direction',
        id: 'f-attrs',
        type: 'bounding_box',
        subs: ['text', 'directional_vector']
      },
      { name: 'Text Box Only', id: 'f-attrs', type: 'bounding_box', subs: [] }
    ]
  }
}
