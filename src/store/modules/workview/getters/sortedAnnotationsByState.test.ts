import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import { StageAnnotation } from '@/store/modules/workview/types'
import { WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let getter: (s: WorkflowStagePayload | null) => StageAnnotation[]

beforeEach(() => {
  store = createTestStore()
  getter = store.getters['workview/sortedAnnotationsByStage']
})

describe('1.0', () => {
  it('returns empty list', () => {
    expect(getter(null)).toEqual([])
  })

  it('returns annotations for stage, sorted by z-index', () => {
    const stage1 = buildWorkflowStagePayload({ id: 1 })
    const stage2 = buildWorkflowStagePayload({ id: 2 })

    const annotations = [
      buildStageAnnotationPayload({ id: 'a', workflow_stage_id: 1, z_index: 2 }),
      buildStageAnnotationPayload({ id: 'b', workflow_stage_id: 1, z_index: 1 }),
      buildStageAnnotationPayload({ id: 'c', workflow_stage_id: 1, z_index: 3 }),
      buildStageAnnotationPayload({ id: 'd', workflow_stage_id: 2, z_index: 2 }),
      buildStageAnnotationPayload({ id: 'e', workflow_stage_id: 1, z_index: undefined })
    ]

    store.commit('workview/SET_STAGE_ANNOTATIONS', { annotations, stage: stage1 })

    expect(getter(stage1).map(a => a.id)).toEqual(['e', 'c', 'a', 'b'])
    expect(getter(stage1).map(a => a.z_index)).toEqual([undefined, 3, 2, 1])

    expect(getter(stage2).map(a => a.id)).toEqual(['d'])
    expect(getter(stage2).map(a => a.z_index)).toEqual([2])
  })
})

describe('2.0', () => {
  beforeEach(() => {
    const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
    store.commit('dataset/SET_DATASETS', [dataset])
    const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
  })
  it('returns empty list', () => {
    expect(getter(null)).toEqual([])
  })

  it('returns annotations for stage, sorted by z-index', () => {
    const annotations = [
      buildStageAnnotationPayload({ id: 'a', z_index: 2 }),
      buildStageAnnotationPayload({ id: 'b', z_index: 1 }),
      buildStageAnnotationPayload({ id: 'c', z_index: 3 }),
      buildStageAnnotationPayload({ id: 'd', z_index: 2 }),
      buildStageAnnotationPayload({ id: 'e', z_index: undefined })
    ]

    store.commit('workview/SET_STAGE_ANNOTATIONS', { annotations, wf2: true })

    expect(getter(null).map(a => a.id)).toEqual(['e', 'c', 'a', 'd', 'b'])
    expect(getter(null).map(a => a.z_index)).toEqual([undefined, 3, 2, 2, 1])
  })
})
