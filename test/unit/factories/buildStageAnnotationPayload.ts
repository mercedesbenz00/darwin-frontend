import { StageAnnotationPayload } from '@/store/types'

type Params = Partial<StageAnnotationPayload>

export const buildStageAnnotationPayload =
  (params: Params): StageAnnotationPayload => ({
    annotation_class_id: -1,
    annotation_group_id: null,
    // default data for every annotation type
    // ensures factory-created annotations are valid by default
    // add more data as necessary
    data: {
      bounding_box: { x: 1, y: 1, w: 1, h: 1 },
      polygon: { path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
      tag: {}
    },
    actors: [],
    id: 'none',
    workflow_stage_id: -1,
    z_index: 1,
    ...params
  })
