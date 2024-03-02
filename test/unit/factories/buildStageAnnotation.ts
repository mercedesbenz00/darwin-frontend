import { StageAnnotation } from '@/store/modules/workview/types'

type Params = Partial<StageAnnotation>

export const buildStageAnnotation =
  (params: Params): StageAnnotation => ({
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
    id: '1',
    workflow_stage_id: -1,
    z_index: 1,
    isSelected: false,
    isVisible: false,
    isHighlighted: false,
    ...params
  })
